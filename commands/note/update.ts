import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Events,
  inlineCode,
  InteractionCollector,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import Command from "modules/command";
import { ChatInputInteractionContext, MessageContext } from "modules/context";

const data = new SlashCommandBuilder().setName("updatenote").setDescription("Update a saved note.");

data.addStringOption((option) => option.setName("name").setDescription("The name of the note").setRequired(true));

const updateNoteModal = (note: { name: string; content: string }, serverName: string) =>
  new ModalBuilder()
    .setCustomId(`updateNote ${note.name}`)
    .setTitle(`Update note ${note.name}} for ${serverName}`)
    .addComponents(
      new ActionRowBuilder<TextInputBuilder>().addComponents(
        new TextInputBuilder()
          .setCustomId("note")
          .setLabel("Note")
          .setPlaceholder("Enter your new note content here")
          .setValue(note.content)
          .setMinLength(1)
          .setStyle(TextInputStyle.Paragraph)
      )
    );

const updateNoteAccess = (note: { name: string }) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`updateNote ${note.name} private`).setStyle(ButtonStyle.Success).setLabel("Private").setEmoji("🔒"),
    new ButtonBuilder().setCustomId(`updateNote ${note.name} public`).setStyle(ButtonStyle.Danger).setLabel("Public").setEmoji("🌐")
  );

async function handleUpdateServerNote(ctx: MessageContext | ChatInputInteractionContext, name: string, content: string) {
  if (!ctx.member!.permissions.has(PermissionFlagsBits.ManageGuild))
    return ctx.reply({ content: "You need the `ManageGuild` permission to update a public note", ephemeral: true });

  if (ctx.original instanceof ChatInputCommandInteraction) {
    await ctx.original.deferReply();

    await ctx.original.showModal(updateNoteModal({ name, content }, ctx.guild!.name));
    const newNote = (
      await ctx.original.awaitModalSubmit({
        filter: (interaction) => interaction.customId === `updateNote ${name}`,
        time: 120000,
      })
    ).fields.getTextInputValue("note");

    await ctx.original.reply({
      content: `What privacy setting would you like to update your note ${inlineCode(name)} to? Current setting: Public`,
      components: [updateNoteAccess({ name })],
    });

    new InteractionCollector(ctx.bot, {
      filter: (interaction) =>
        interaction.isButton() && interaction.user.id === ctx.author.id && interaction.customId.startsWith(`updateNote ${name}`),
      time: 30000,
    }).on(Events.InteractionCreate, async (interaction) => {
      if (!interaction.isButton()) return;
      if (interaction.user.id !== ctx.author.id) interaction.reply({ content: "This button is not for you lmao.", ephemeral: true });

      const isPublic = interaction.customId.endsWith("public");
      if (isPublic) {
        // just need to save new note
        ctx.bot.db.ref("servers").child(ctx.guild!.id).child("notes").child(name).set(newNote);
        ctx.bot.cache.set(`servers:${ctx.guild!.id}:notes:${name}`, newNote);
      } else {
        // delete old note and save new note
        ctx.bot.db.ref("servers").child(ctx.guild!.id).child("notes").child(name).remove();
        ctx.bot.cache.delete(`servers:${ctx.guild!.id}:notes:${name}`);

        ctx.bot.db.ref("users").child(ctx.author.id).child("notes").child(name).set(newNote);
        ctx.bot.cache.set(`users:${ctx.author.id}:notes:${name}`, newNote);
      }

      interaction.reply({ content: `I've updated your note ${inlineCode(name)}.`, ephemeral: true });
    });

    return;
  } else {
    ctx.original.reply({
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`updateNote ${name}`).setLabel("Update"))],
    });
    return;
  }
}

export default new Command({
  data,
  async run(ctx) {
    const name = ctx.options.get("name", true);

    let userNote: string | undefined = ctx.bot.cache.get(`users:${ctx.author.id}:notes:${name}`);
    if (!userNote) {
      const s = await ctx.bot.db.ref("users").child(ctx.author.id).child("notes").child(name).get();
      if (s.exists()) {
        userNote = await s.val()!;
        ctx.bot.cache.set(`users:${ctx.author.id}:notes:${name}`, userNote);
      }
    }

    let serverNote: string | undefined;

    if (ctx.guild) {
      serverNote = ctx.bot.cache.get(`servers:${ctx.guild.id}:notes:${name}`);
      if (!serverNote) {
        const s = await ctx.bot.db.ref("servers").child(ctx.guild.id).child("notes").child(name).get();
        if (s.exists()) {
          serverNote = await s.val()!;
          ctx.bot.cache.set(`servers:${ctx.guild.id}:notes:${name}`, serverNote);
        }
      }
    }

    if (!userNote) {
      if (!serverNote) {
        ctx.reply(`I couldn't find your note with the name ${inlineCode(name)}.`);
        return;
      }

      await handleUpdateServerNote(ctx, name, serverNote);
    } else {
      if (serverNote) {
        ctx.reply({
          content: `I found a private and public note with the name ${inlineCode(name)}. Which one would you like to update?`,
          components: [
            new ActionRowBuilder<ButtonBuilder>().addComponents(
              new ButtonBuilder().setCustomId(`updateNote ${name} private`).setStyle(ButtonStyle.Success).setLabel("Private").setEmoji("🔒"),
              new ButtonBuilder().setCustomId(`updateNote ${name} public`).setStyle(ButtonStyle.Danger).setLabel("Public").setEmoji("🌐")
            ),
          ],
        });
      }
    }

    ctx.reply({ content: `I've remembered your note ${inlineCode(name)}.`, ephemeral: true, allowedMentions: { parse: [] } });
  },
});
