import { codeBlock, inlineCode, SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

const data = new SlashCommandBuilder().setName("getnote").setDescription("Get a note set by you.");

data.addStringOption((option) => option.setName("name").setDescription("The name of the note").setRequired(true));

export default new Command({
  data,
  async run(ctx) {
    const name = ctx.options.get("name");

    let note = ctx.bot.cache.get(`users:${ctx.author.id}:notes:${name}`) as string | undefined;
    if (!note) {
      const s = await ctx.bot.db.ref("users").child(ctx.author.id).child("notes").child(name).get();

      if (!s.exists()) {
        ctx.reply(`I couldn't find your note with the name ${inlineCode(name)}.`);
        return;
      }

      note = s.val();
      ctx.bot.cache.set(`users:${ctx.author.id}:notes:${name}`, note);
    }

    ctx.reply({ content: `Here is your note ${inlineCode(name)}: ${codeBlock(note)}`, ephemeral: true, allowedMentions: { parse: [] } });
  },
});
