import Bot from "Bot";
import { Events } from "discord.js";

export default (bot: Bot) => {
  bot.on(Events.ClientReady, (client) => {
    console.log(`Logged in as ${client.user?.tag}`);
  });
};
