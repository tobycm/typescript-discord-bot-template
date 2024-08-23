import Bot from "Bot";
import { Events } from "discord.js";

const admins = process.env.ADMINS?.split(",") || [];

export default (bot: Bot) => {
  bot.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    if (!admins.includes(message.author.id)) return;

    if (message.content.split(" ")[1] === "deploy")
      try {
        await message.client.application?.commands.set(Array.from(message.client.commands.values()).map((command) => command.data));
        await message.reply("Deployed commands.");
        console.log("Deployed commands.");
      } catch (error) {
        console.error(error);
        await message.reply("Failed to deploy commands.");
      }
  });
};
