import { AceBase } from "acebase";
import { AceBaseClient } from "acebase-client";
import Command from "modules/command";
import langs from "./lang/index";

declare module "discord.js" {
  export interface Client {
    commands: Map<string, Command>;

    lang: typeof langs;

    cache: Map<string, any>;

    db: AceBase | AceBaseClient;
  }
}
