import { inlineCode, SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

const data = new SlashCommandBuilder().setName("prefix").setDescription("Set a custom prefix for the bot.");

data.addStringOption((option) => option.setName("prefix").setDescription("The new prefix for this server"));

export default new Command({
  data,
  run(ctx) {
    const prefix = ctx.options.get("prefix");

    if (!prefix) {
      ctx.bot.db.ref("servers").child(ctx.guild.id).child("prefix").remove();
      ctx.bot.cache.delete(`servers:${ctx.guild.id}:prefix`);

      ctx.reply("I've reset the prefix to the default one.");
      return;
    }

    ctx.bot.db.ref("servers").child(ctx.guild.id).child("prefix").set(prefix);
    ctx.bot.cache.set(`servers:${ctx.guild.id}:prefix`, prefix);

    ctx.reply(`I've set the prefix to ${inlineCode(prefix)}.`);
  },
});
