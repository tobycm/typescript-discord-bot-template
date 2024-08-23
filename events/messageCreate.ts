import Bot from "Bot";
import { Events, inlineCode, userMention } from "discord.js";
import Constants from "modules/constants";
import { MessageContext } from "modules/context";
import { messageToInteractionOptions } from "modules/context/converters";

// const admins = process.env.ADMINS?.split(",") || [];

export default function messageCreateEvent(bot: Bot) {
  bot.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (!message.inGuild()) return;

    let prefix = message.client.cache.get(`prefix:${message.guild.id}`) as string | null | undefined;

    if (prefix === null) prefix = Constants.defaultPrefix;
    else if (prefix === undefined) {
      // cache miss
      const s = await message.client.db.ref("servers").child(message.guild.id).child("prefix").get();

      if (!s.exists()) {
        // default prefix
        prefix = Constants.defaultPrefix;
        message.client.cache.set(`prefix:${message.guild.id}`, null);
      } else {
        prefix = s.val();
        message.client.cache.set(`prefix:${message.guild.id}`, prefix);
      }
    }

    if (message.content === userMention(message.client.user?.id)) {
      message.reply(`Prefix của mình là ${inlineCode(prefix)}.`);
      return;
    }

    if (!message.content.startsWith(prefix)) return;

    const [commandName, ...args] = message.content.slice(prefix.length, message.content.length).split(" ");

    if (commandName === "deploy") {
      const commands = Array.from(message.client.commands.values());

      try {
        await bot.application?.commands.set(commands.map((command) => command.data));
        await message.reply("Deployed commands.");
        console.log("Deployed commands requested by", message.author.displayName);
      } catch (error) {
        console.error("Failed to deploy commands requested by", message.author.displayName, "with error:", error);
        await message.reply("Failed to deploy commands.");
      }
    } else if (commandName === "test") {
    } else {
      const command = message.client.commands.get(commandName);
      if (!command) return;

      const ctx = new MessageContext(message);
      messageToInteractionOptions(ctx, args, command.data.options);

      try {
        await command.run(ctx);
      } catch (error) {
        console.error(error);
        await message.reply("An error occurred while executing this command.");
      }
    }
  });
}
