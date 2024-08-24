import Bot from "Bot";
import Command from "modules/command";
import help from "./help";
import note from "./note";
import ping from "./ping";
import prefix from "./prefix";
import random from "./random";

const commands: Command[] = [
  ping, // add your commands here
  note.get,
  note.set,
  prefix,
  random,
  help,
];

export default function setupCommands(bot: Bot) {
  commands.forEach((command) => bot.commands.set(command.data.name, command));
}
