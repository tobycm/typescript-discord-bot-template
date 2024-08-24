import Bot from "Bot";
import { setHelpChoices } from "commands/help";
import { Events } from "discord.js";

const lateInit: ((bot: Bot) => any)[] = [setHelpChoices];

export default (bot: Bot) => {
  bot.on(Events.ClientReady, (client) => {
    console.log(`Logged in as ${client.user?.tag}`);

    for (const init of lateInit) {
      init(bot);
    }
  });
};
