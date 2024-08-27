import { SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

export default new Command({
  data: new SlashCommandBuilder().setName("ping").setDescription("Replies with the bot gateway latency."),
  run(ctx) {
    ctx.reply({ content: ctx.lang.commands.ping.replaceAll("%%latency%%", `${ctx.bot.ws.ping}`), ephemeral: true });
  },
});
