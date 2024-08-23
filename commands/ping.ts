import { SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

export default new Command({
  data: new SlashCommandBuilder().setName("ping").setDescription("Replies with the bot gateway latency."),
  run(ctx) {
    ctx.reply({ content: `🏓 Pong! Gateway latency is ${ctx.bot.ws.ping}ms.`, ephemeral: true });
  },
});
