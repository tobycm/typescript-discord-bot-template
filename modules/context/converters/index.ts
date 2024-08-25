import { ApplicationCommandOptionBase, SlashCommandBooleanOption, SlashCommandIntegerOption, SlashCommandStringOption, inlineCode } from "discord.js";
import { MessageContext } from "..";
import parseAndValidateBoolean from "./validators/boolean";
import validateInteger from "./validators/integer";
import validateString from "./validators/string";

export function messageToInteractionOptions(ctx: MessageContext, args: string[], options: ApplicationCommandOptionBase[]) {
  for (const option of options) {
    const arg = args.shift();

    if (!arg) {
      if (option.required) {
        ctx.reply(`Missing required argument: ${inlineCode(option.name)}`);
        return;
      }

      continue;
    }

    if (option instanceof SlashCommandStringOption) {
      const result = validateString(arg, option);
      if (result) return ctx.reply(result);

      ctx.options.set(option.name, arg);
    }

    if (option instanceof SlashCommandIntegerOption) {
      const result = validateInteger(arg, option);
      if (result) return ctx.reply(result);

      ctx.options.set(option.name, parseInt(arg));
    }

    if (option instanceof SlashCommandBooleanOption) {
      const result = parseAndValidateBoolean(arg);
      if (typeof result === "string") return ctx.reply(result);

      ctx.options.set(option.name, result);
    }
  }
}
