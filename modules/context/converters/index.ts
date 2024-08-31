import {
  ApplicationCommandOptionBase,
  SlashCommandAttachmentOption,
  SlashCommandBooleanOption,
  SlashCommandIntegerOption,
  SlashCommandStringOption,
  SlashCommandUserOption,
  inlineCode,
} from "discord.js";
import { parseIdFromUserMention } from "modules/utils";
import { MessageContext } from "..";
import parseAndValidateBoolean from "./validators/boolean";
import validateInteger from "./validators/integer";
import validateString from "./validators/string";

export function messageToInteractionOptions(ctx: MessageContext, args: string[], options: ApplicationCommandOptionBase[]) {
  const attachments = ctx.original.attachments.map((a) => a);

  for (const option of options) {
    let arg = args.shift();

    if (!arg) {
      if (option.required && !(option instanceof SlashCommandAttachmentOption))
        return ctx.reply(`Missing required argument: ${inlineCode(option.name)}`);

      if (!(option instanceof SlashCommandAttachmentOption)) continue;
    }

    arg = arg!;

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

    if (option instanceof SlashCommandUserOption) {
      let user = ctx.guild?.members.cache.find((member) => member.nickname === arg);

      if (!user) user = ctx.guild?.members.cache.find((member) => member.user.username === arg);

      if (!user) user = ctx.guild?.members.cache.get(arg);
      if (!user) {
        const id = parseIdFromUserMention(arg);
        if (!id) return ctx.reply("User not found in this server");
        user = ctx.guild?.members.cache.get(id);
      }

      if (!user) return ctx.reply("User not found in this server");

      ctx.options.set(option.name, user);
    }

    if (option instanceof SlashCommandAttachmentOption) {
      const attachment = attachments.shift();
      if (!attachment) return ctx.reply("Attachment not found");

      ctx.options.set(option.name, attachment);
    }
  }
}
