import { SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

export default new Command({
  data: new SlashCommandBuilder().setName("ping").setDescription("Replies with Pong!"),
  run: (interaction) => interaction.reply("Pong!"),
});
