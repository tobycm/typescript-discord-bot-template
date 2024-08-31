import Bot from "Bot";
import { ApplicationCommandOptionBase, Events, inlineCode, userMention } from "discord.js";
import Constants from "modules/constants";
import { MessageContext } from "modules/context";
import { messageToInteractionOptions } from "modules/context/converters";
import { checkPermissions } from "modules/utils";

// const admins = process.env.ADMINS?.split(",") || [];

export default function messageCreateEvent(bot: Bot) {
  bot.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;

    let prefix: string | null = Constants.defaultPrefix;

    if (message.inGuild()) {
      const guildPrefix = message.client.cache.get(`servers:${message.guild.id}:prefix`) as string | null | undefined;

      if (guildPrefix === undefined) {
        // cache miss
        const s = await message.client.db.ref("servers").child(message.guild.id).child("prefix").get();

        if (!s.exists())
          // default prefix
          prefix = null;
        else prefix = s.val();

        message.client.cache.set(`servers:${message.guild.id}:prefix`, prefix);
      }
    }

    if (prefix === null) prefix = Constants.defaultPrefix;

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

      if (command.guildOnly && !message.inGuild()) {
        await message.reply("This command can only be used in a server.");
        return;
      }

      if (command.data.default_member_permissions && message.member) {
        const missingPermissions = checkPermissions(message.member, BigInt(command.data.default_member_permissions));

        if (missingPermissions.length) {
          await message.reply(`You are missing the following permissions: ${inlineCode(missingPermissions.join(", "))}`);
          return;
        }
      }

      const ctx = await MessageContext(message);
      if (messageToInteractionOptions(ctx, args, command.data.options as ApplicationCommandOptionBase[])) return;

      try {
        await command.run(ctx);
      } catch (error) {
        console.error(error);
        await message.reply("An error occurred while executing this command.");
      }
    }
  });
}
