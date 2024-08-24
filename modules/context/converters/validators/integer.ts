import { inlineCode, SlashCommandIntegerOption } from "discord.js";

export default function validateInteger(arg: string, option: SlashCommandIntegerOption): string | undefined {
  const num = parseInt(arg, 10);

  if (isNaN(num)) return "Invalid number.";

  if (option.choices && !option.choices.map((c) => c.value).includes(num))
    return "Invalid choice. Available choices: " + inlineCode(option.choices.map((c) => c.name).join(", "));

  if (option.min_value && num < option.min_value) return "The argument is too small. It must be at least " + option.min_value + ".";

  if (option.max_value && num > option.max_value) return "The argument is too large. It must be at most " + option.max_value + ".";

  return;
}
