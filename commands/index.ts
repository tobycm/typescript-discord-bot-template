import Bot from "Bot";
import Command from "modules/command";
import ping from "./ping";

const commands: Command[] = [
  ping, // add your commands here
];

export default function setupCommands(bot: Bot) {
  commands.forEach((command) => bot.commands.set(command.data.name, command));
}
