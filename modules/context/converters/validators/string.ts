import { inlineCode, SlashCommandStringOption } from "discord.js";

export default function validateString(arg: string, option: SlashCommandStringOption): string | undefined {
  if (option.choices && !option.choices.map((c) => c.value).includes(arg))
    return "Invalid choice. Available choices: " + inlineCode(option.choices.map((c) => c.name).join(", "));

  if (option.min_length && arg.length < option.min_length)
    return "The argument is too short. It must be at least " + option.min_length + " characters long.";

  if (option.max_length && arg.length > option.max_length)
    return "The argument is too long. It must be at most " + option.max_length + " characters long.";
}
