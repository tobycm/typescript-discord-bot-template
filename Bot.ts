import { AceBase } from "acebase";
import { Client, type ClientOptions } from "discord.js";
import Command from "modules/command";

interface BotOptions {
  discord: ClientOptions;
  acebase: string;
}

export default class Bot extends Client {
  constructor(options: BotOptions) {
    super(options.discord);

    this.db = new AceBase(options.acebase);
    this.db.on("connecting", () => console.debug("Connecting to Redis"));
    this.db.on("connect", () => console.log("Connected to Redis"));

    this.db.on("error", (error) => console.error("Redis error:", error));
  }

  commands = new Map<string, Command>();

  db: AceBase;
}
