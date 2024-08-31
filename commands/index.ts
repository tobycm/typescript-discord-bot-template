import Bot from "Bot";
import Command from "modules/command";
import cunny from "./cunny";
import fileinfo from "./fileinfo";
import help from "./help";
import note from "./note";
import ping from "./ping";
import prefix from "./prefix";
import random from "./random";

const commands: Command[] = [
  ping, // add your commands here
  note.get,
  note.set,
  note.update,
  note._delete,
  prefix,
  random,
  cunny,
  fileinfo,
  help,
];

export default function setupCommands(bot: Bot) {
  commands.forEach((command) => bot.commands.set(command.data.name, command));
}
