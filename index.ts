import { GatewayIntentBits, Partials } from "discord.js";
import Bot from "./Bot";
import setupCommands from "./commands";
import { setupBotEvents, setupDatabaseEvents } from "./events";

// Creating an instance of the Discord.js client
const bot = new Bot({
  discord: {
    intents: [
      GatewayIntentBits.Guilds, //
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.GuildVoiceStates,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
    ],
    partials: [Partials.Channel],
  },
  acebase: {
    type: "local",
    databaseName: "bot",
  },
  cache: {
    lifespan: 5000,
  },
});

setupCommands(bot);
setupBotEvents(bot);
setupDatabaseEvents(bot.db);

if (!process.env.DISCORD_TOKEN) {
  console.error("No Discord token provided.");
  process.exit(1);
}

// Logging in with the Discord token
bot.login(process.env.DISCORD_TOKEN);
