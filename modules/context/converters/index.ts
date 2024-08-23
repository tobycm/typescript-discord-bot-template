import { SlashCommandBuilder, SlashCommandStringOption, inlineCode } from "discord.js";
import { MessageContext } from "..";
import validateString from "./validators/string";

export function messageToInteractionOptions(ctx: MessageContext, args: string[], options: SlashCommandBuilder["options"]) {
  for (const option of options) {
    const arg = args.shift();

    if (option instanceof SlashCommandStringOption) {
      if (option.required && !arg) {
        ctx.reply(`Missing required argument: ${inlineCode(option.name)}`);
        return;
      }

      const result = validateString(arg, option);
      if (result) return ctx.reply(result);

      ctx.options.set(option.name, arg);
    }
  }
}
