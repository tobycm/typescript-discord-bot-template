import { AceBase } from "acebase";
import { AceBaseClient, AceBaseClientConnectionSettings } from "acebase-client";
import { Client, type ClientOptions } from "discord.js";
import Command from "modules/command";

interface AceBaseLocalOptions {
  type: "local";
  databaseName: string;
}

interface AceBaseClientOptions extends AceBaseClientConnectionSettings {
  type: "client";
}

interface BotOptions {
  discord: ClientOptions;
  acebase: AceBaseLocalOptions | AceBaseClientOptions;
}

export default class Bot extends Client {
  constructor(options: BotOptions) {
    super(options.discord);

    if (options.acebase.type === "local") {
      this.db = new AceBase(options.acebase.databaseName);
    }
    if (options.acebase.type === "client") {
      this.db = new AceBaseClient(options.acebase);
    }

    this.db.on("connecting", () => console.debug("Connecting to Redis"));
    this.db.on("connect", () => console.log("Connected to Redis"));

    this.db.on("error", (error) => console.error("Redis error:", error));
  }

  commands = new Map<string, Command>();

  cache = new Map<string, any>();

  db: AceBase | AceBaseClient;
}
