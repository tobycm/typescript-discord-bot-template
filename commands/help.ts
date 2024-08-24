import Bot from "Bot";
import { bold, codeBlock, inlineCode, SlashCommandBuilder, SlashCommandStringOption, strikethrough } from "discord.js";
import Command from "modules/command";
import Constants from "modules/constants";
import { checkPermissions, commandUsage, intToBitField } from "modules/utils";

const data = new SlashCommandBuilder().setName("help").setDescription("Show help for commands.");

let commandOption: SlashCommandStringOption;

data.addStringOption((option) => {
  commandOption = option;
  return option.setName("command").setDescription("The command to show help for");
});

export function setHelpChoices(bot: Bot) {
  const commandNames = Array.from(bot.commands.values()).map((command) => command.data.name);

  commandOption.addChoices(...commandNames.map((name) => ({ name, value: name })));
}

export default new Command({
  data,
  async run(ctx) {
    const commandName = ctx.options.get("command") as string | undefined;

    if (commandName) {
      const command = ctx.bot.commands.get(commandName);

      if (!command) {
        ctx.reply(`I couldn't find a command with the name ${inlineCode(commandName)}.`);
        return;
      }
      const prefix = ctx.bot.cache.get(`servers:${ctx.guild.id}:prefix`) ?? Constants.defaultPrefix;

      let content = "# " + bold(inlineCode(command.data.name)) + "\n" + command.data.description;

      content += "\n## Usage:\n";
      content += codeBlock("ts", prefix + command.data.name + " " + commandUsage(command));
      content += "\n-# [] are optional arguments | <> are required arguments";

      if (command.data.default_member_permissions) {
        const missingPermissions = checkPermissions(ctx.member, BigInt(command.data.default_member_permissions));
        const permissions = intToBitField(BigInt(command.data.default_member_permissions)).filter((perm) => !missingPermissions.includes(perm));
        content += `\n## Permissions:\n`;

        content += codeBlock("ansi", "\u001b[0;36m" + [permissions.join(", "), missingPermissions.join(", ")].join("\u001b[1;31m"));
        content += "\n-# Green permissions are granted | Red permissions are missing";
      }

      ctx.reply({ content, ephemeral: true });
      return;
    }

    const commands = Array.from(ctx.bot.commands.values()).map((command) => {
      const content = `${bold(inlineCode(command.data.name))} - ${command.data.description}`;
      if (command.data.default_member_permissions) {
        const missingPermissions = checkPermissions(ctx.member, BigInt(command.data.default_member_permissions));
        if (missingPermissions.length) return `${strikethrough(content)} - (Missing permissions: ${inlineCode(missingPermissions.join(", "))})`;
      }
      return content;
    });

    ctx.reply({ content: `Here is a list of commands:\n${commands.join("\n")}`, ephemeral: true });
  },
});
