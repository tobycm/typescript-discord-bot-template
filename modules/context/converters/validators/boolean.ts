import { inlineCode } from "discord.js";

export default function parseAndValidateBoolean(arg: string): string | boolean {
  if (["true", "yes", "on", "1", "y"].includes(arg.toLowerCase())) return true;
  if (["false", "no", "off", "0", "n"].includes(arg.toLowerCase())) return false;

  return "Invalid boolean. Available choices: " + inlineCode("true, false");
}
