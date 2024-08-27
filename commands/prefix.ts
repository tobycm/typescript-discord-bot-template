import { inlineCode, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

const data = new SlashCommandBuilder()
  .setName("prefix")
  .setDescription("Set a custom prefix for the bot.")
  .setDMPermission(false)
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild);

data.addStringOption((option) => option.setName("prefix").setDescription("The new prefix for this server"));

export default new Command({
  data,
  guildOnly: true,

  run(ctx) {
    const prefix = ctx.options.get("prefix");

    if (!prefix) {
      ctx.bot.db.ref("servers").child(ctx.guild.id).child("prefix").remove();
      ctx.bot.cache.delete(`servers:${ctx.guild.id}:prefix`);

      ctx.reply(ctx.lang.commands.prefix.reset);
      return;
    }

    ctx.bot.db.ref("servers").child(ctx.guild.id).child("prefix").set(prefix);
    ctx.bot.cache.set(`servers:${ctx.guild.id}:prefix`, prefix);

    ctx.reply(ctx.lang.commands.prefix.set.replaceAll("%%prefix%%", inlineCode(prefix)));
  },
});
