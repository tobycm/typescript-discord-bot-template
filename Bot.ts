import { AceBase } from "acebase";
import { AceBaseClient, AceBaseClientConnectionSettings } from "acebase-client";
import { Client, type ClientOptions } from "discord.js";
import Command from "modules/command";
import langs from "./lang/index";

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

export default class Bot<Ready extends boolean = boolean> extends Client<Ready> {
  constructor(options: BotOptions) {
    super(options.discord);

    if (options.acebase.type === "local") this.db = new AceBase(options.acebase.databaseName);
    else if (options.acebase.type === "client") this.db = new AceBaseClient(options.acebase);
    else this.db = new AceBase("bot");
  }

  commands = new Map<string, Command>();

  lang = langs;

  cache = new Map<string, any>();

  db: AceBase | AceBaseClient;
}
