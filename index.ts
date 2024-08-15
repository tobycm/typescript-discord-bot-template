import { Events, GatewayIntentBits } from "discord.js";
import Bot from "./Bot";
import commands from "./commands";

// Creating an instance of the Discord.js client
const client = new Bot({
  discord: {
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildVoiceStates],
  },
  redis: process.env.REDIS_URL ?? 6379,
});

const admins = process.env.ADMINS?.split(",") || [];

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;

  if (!admins.includes(message.author.id)) return;

  if (message.content.split(" ")[1] === "deploy")
    try {
      await client.application?.commands.set(commands.map((command) => command.data));
      await message.reply("Deployed commands.");
      console.log("Deployed commands.");
    } catch (error) {
      console.error(error);
      await message.reply("Failed to deploy commands.");
    }
});

// Event: Interaction created
client.on(Events.InteractionCreate, async (interaction) => {
  if (interaction.isButton()) return;

  if (interaction.isAutocomplete()) {
    const command = commands.find((cmd) => cmd.data.name === interaction.commandName);
    if (!command?.completion) return;

    return await command.completion(interaction);
  }

  if (!interaction.isChatInputCommand()) return;

  const command = commands.find((cmd) => cmd.data.name === interaction.commandName);
  if (!command) return;

  try {
    await command.run(interaction);
  } catch (error) {
    console.error(error);
    await interaction.reply("An error occurred while executing this command.");
  }
});

if (!process.env.DISCORD_TOKEN) {
  console.error("No Discord token provided.");
  process.exit(1);
}

// Logging in with the Discord token
client.login(process.env.DISCORD_TOKEN);
