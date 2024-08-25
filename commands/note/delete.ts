import { inlineCode, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

const data = new SlashCommandBuilder().setName("deletenote").setDescription("Delete a saved note.");

data.addStringOption((option) => option.setName("name").setDescription("The name of the note").setRequired(true));

export default new Command({
  data,
  run(ctx) {
    const name = ctx.options.get("name", true);
    const note = ctx.options.get("note", true);
    const publicNote = ctx.options.get("public") ?? false;

    if (!publicNote) {
      ctx.bot.db.ref("users").child(ctx.author.id).child("notes").child(name).set(note);
      ctx.bot.cache.set(`users:${ctx.author.id}:notes:${name}`, note);
    } else {
      if (!ctx.guild) return ctx.reply({ content: "You can only set a public note in a server", ephemeral: true });
      if (!ctx.member?.permissions.has(PermissionFlagsBits.ManageGuild))
        return ctx.reply({ content: "You need the `ManageGuild` permission to set a public note", ephemeral: true });
      ctx.bot.db.ref("servers").child(ctx.guild.id).child("notes").child(name).set(note);
      ctx.bot.cache.set(`notes:${name}`, note);
    }

    ctx.reply({ content: `I've remembered your note ${inlineCode(name)}.`, ephemeral: true, allowedMentions: { parse: [] } });
  },
});
