import { SlashCommandBuilder, SlashCommandIntegerOption, SlashCommandStringOption, inlineCode } from "discord.js";
import { MessageContext } from "..";
import validateInteger from "./validators/integer";
import validateString from "./validators/string";

export function messageToInteractionOptions(ctx: MessageContext, args: string[], options: SlashCommandBuilder["options"]) {
  for (const option of options) {
    const arg = args.shift();

    if (option instanceof SlashCommandStringOption) {
      if (!arg)
        if (option.required) {
          ctx.reply(`Missing required argument: ${inlineCode(option.name)}`);
          return;
        } else continue;

      const result = validateString(arg, option);
      if (result) return ctx.reply(result);

      ctx.options.set(option.name, arg);
    }

    if (option instanceof SlashCommandIntegerOption) {
      if (!arg)
        if (option.required) {
          ctx.reply(`Missing required argument: ${inlineCode(option.name)}`);
          return;
        } else continue;

      const result = validateInteger(arg, option);
      if (result) return ctx.reply(result);

      ctx.options.set(option.name, parseInt(arg));
    }
  }
}
