import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  ComponentType,
  inlineCode,
  ModalBuilder,
  PermissionFlagsBits,
  SlashCommandBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { collectFirstInteraction } from "modules/asyncCollectors";
import Command from "modules/command";
import { ChatInputInteractionContext, MessageContext } from "modules/context";

const data = new SlashCommandBuilder().setName("updatenote").setDescription("Update a saved note.");

data.addStringOption((option) => option.setName("name").setDescription("The name of the note").setRequired(true));

type Note = { name: string; content: string };

const updateNoteModal = (note: Note, serverName?: string) =>
  new ModalBuilder()
    .setCustomId(`updateNote ${note.name}`)
    .setTitle(`Update note ${note.name}}` + (serverName ? ` in ${serverName}` : ""))
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

const updateNoteAccess = (note: Note) =>
  new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder().setCustomId(`updateNote ${note.name} private`).setStyle(ButtonStyle.Success).setLabel("Private").setEmoji("🔒"),
    new ButtonBuilder().setCustomId(`updateNote ${note.name} public`).setStyle(ButtonStyle.Danger).setLabel("Public").setEmoji("🌐")
  );

async function handleUpdateServerNote(ctx: MessageContext | ChatInputInteractionContext, note: Note) {
  if (!ctx.member!.permissions.has(PermissionFlagsBits.ManageGuild))
    return ctx.reply({ content: "You need the `ManageGuild` permission to update a public note", ephemeral: true });

  let interaction: ChatInputCommandInteraction | ButtonInteraction;

  if (ctx.original instanceof ChatInputCommandInteraction) {
    ctx.original.deferReply();

    interaction = ctx.original;
  } else {
    ctx.original.reply({
      content: "Please click the button to open the update modal.",
      components: [
        new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`updateNoteServer ${name}`).setLabel("Update")),
      ],
    });

    const openModal = await collectFirstInteraction<ButtonInteraction>(ctx.bot, {
      componentType: ComponentType.Button,
      filter: (interaction) => interaction.user.id === ctx.author.id && interaction.customId === `updateNoteServer ${name}`,
      time: 30000,
    });

    interaction = openModal;
  }

  interaction.showModal(updateNoteModal(note, ctx.guild!.name));

  const modalResponse = await interaction.awaitModalSubmit({
    filter: (interaction) => interaction.customId === `updateNote ${note.name}`,
    time: 120000,
  });

  modalResponse.reply({
    content: `What privacy setting would you like to update your note ${inlineCode(note.name)} to? Current setting: Public`,
    components: [updateNoteAccess(note)],
  });

  const privacyResponse = await collectFirstInteraction<ButtonInteraction>(ctx.bot, {
    componentType: ComponentType.Button,
    filter: (interaction) => interaction.user.id === ctx.author.id && interaction.customId.startsWith(`updateNote ${name}`),
    time: 30000,
  });

  const isPublic = privacyResponse.customId.endsWith("public");

  if (isPublic) {
    // just need to save new note
    ctx.bot.db.ref("servers").child(ctx.guild!.id).child("notes").child(note.name).set(note.content);
    ctx.bot.cache.set(`servers:${ctx.guild!.id}:notes:${note.name}`, note.content);
  } else {
    // delete old note and save new note
    ctx.bot.db.ref("servers").child(ctx.guild!.id).child("notes").child(note.name).remove();
    ctx.bot.cache.delete(`servers:${ctx.guild!.id}:notes:${note.name}`);

    ctx.bot.db.ref("users").child(ctx.author.id).child("notes").child(note.name).set(note.content);
    ctx.bot.cache.set(`users:${ctx.author.id}:notes:${note.name}`, note.content);
  }

  privacyResponse.reply({ content: `I've updated your note ${inlineCode(note.name)}.`, ephemeral: true });
}

async function handleUpdateUserNote(ctx: MessageContext | ChatInputInteractionContext, note: Note) {
  let interaction: ChatInputCommandInteraction | ButtonInteraction;

  if (ctx.original instanceof ChatInputCommandInteraction) {
    ctx.original.deferReply();

    interaction = ctx.original;
  } else {
    ctx.original.reply({
      content: "Please click the button to open the update modal.",
      components: [new ActionRowBuilder<ButtonBuilder>().addComponents(new ButtonBuilder().setCustomId(`updateNote ${name}`).setLabel("Update"))],
    });

    const openModal = await collectFirstInteraction<ButtonInteraction>(ctx.bot, {
      componentType: ComponentType.Button,
      filter: (interaction) => interaction.user.id === ctx.author.id && interaction.customId === `updateNote ${name}`,
      time: 30000,
    });

    interaction = openModal;
  }

  interaction.showModal(updateNoteModal(note));

  const modalResponse = await interaction.awaitModalSubmit({
    filter: (interaction) => interaction.customId === `updateNote ${note.name}`,
    time: 120000,
  });

  modalResponse.reply({
    content: `What privacy setting would you like to update your note ${inlineCode(note.name)} to? Current setting: Private`,
    components: [updateNoteAccess(note)],
  });

  const privacyResponse = await collectFirstInteraction<ButtonInteraction>(ctx.bot, {
    componentType: ComponentType.Button,
    filter: (interaction) => interaction.user.id === ctx.author.id && interaction.customId.startsWith(`updateNote ${name}`),
    time: 30000,
  });

  const isPublic = privacyResponse.customId.endsWith("public");

  if (isPublic) {
    // save note to server
    if (ctx.guild) {
      ctx.bot.db.ref("servers").child(ctx.guild.id).child("notes").child(note.name).set(note.content);
      ctx.bot.cache.set(`servers:${ctx.guild.id}:notes:${note.name}`, note.content);
    }
  } else {
    // save note to user
    ctx.bot.db.ref("users").child(ctx.author.id).child("notes").child(note.name).set(note.content);
    ctx.bot.cache.set(`users:${ctx.author.id}:notes:${note.name}`, note.content);
  }

  privacyResponse.reply({ content: `I've updated your note ${inlineCode(note.name)}.`, ephemeral: true });
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
      if (!serverNote) return ctx.reply(`I couldn't find your note with the name ${inlineCode(name)}.`);

      await handleUpdateServerNote(ctx, { name, content: serverNote });
      return;
    }

    if (serverNote) {
      ctx.reply({
        content: `I found a private and public note with the name ${inlineCode(name)}. Which one would you like to update?`,
        components: [
          new ActionRowBuilder<ButtonBuilder>().addComponents(
            new ButtonBuilder().setCustomId(`updateNote ${name}`).setStyle(ButtonStyle.Success).setLabel("Private").setEmoji("🔒"),
            new ButtonBuilder().setCustomId(`updateNoteServer ${name}`).setStyle(ButtonStyle.Danger).setLabel("Public").setEmoji("🌐")
          ),
        ],
      });

      const selectNote = await collectFirstInteraction<ButtonInteraction>(ctx.bot, {
        componentType: ComponentType.Button,
        filter: (interaction) => interaction.user.id === ctx.author.id && interaction.customId.startsWith("updateNote"),
        time: 30000,
      });

      if (selectNote.customId.startsWith("updateNoteServer")) return await handleUpdateServerNote(ctx, { name, content: serverNote });
    }

    await handleUpdateUserNote(ctx, { name, content: userNote });
  },
});
