import { inlineCode, SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

const data = new SlashCommandBuilder().setName("setnote").setDescription("Let me remember a note for you.");

data.addStringOption((option) => option.setName("name").setDescription("The name of the note").setRequired(true));
data.addStringOption((option) => option.setName("note").setDescription("The content of the note").setRequired(true));

export default new Command({
  data,
  run(ctx) {
    const name = ctx.options.get("name");
    const note = ctx.options.get("note");

    ctx.bot.db.ref("users").child(ctx.author.id).child("notes").child(name).set(note);
    ctx.bot.cache.set(`users:${ctx.author.id}:notes:${name}`, note);

    ctx.reply(`I've remembered your note ${inlineCode(name)}.`);
  },
});
