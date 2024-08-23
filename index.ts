import { GatewayIntentBits } from "discord.js";
import Bot from "./Bot";
import setupCommands from "./commands";
import setupEvents from "./events";

// Creating an instance of the Discord.js client
const bot = new Bot({
  discord: {
    intents: [
      GatewayIntentBits.Guilds, //
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
    ],
  },
  acebase: "bot", // database name
});

setupCommands(bot);
setupEvents(bot);

if (!process.env.DISCORD_TOKEN) {
  console.error("No Discord token provided.");
  process.exit(1);
}

// Logging in with the Discord token
bot.login(process.env.DISCORD_TOKEN);
