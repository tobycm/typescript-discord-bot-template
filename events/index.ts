import Bot from "Bot";
import interactionCreate from "./interactionCreate";
import messageCreate from "./messageCreate";
import ready from "./ready";

const events: ((bot: Bot) => void)[] = [
  ready, //
  messageCreate,
  interactionCreate,
];

export default function setupEvents(bot: Bot) {
  events.forEach((event) => event(bot));
}
