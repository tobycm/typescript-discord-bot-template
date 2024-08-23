import { AceBase } from "acebase";
import { AceBaseClient } from "acebase-client";
import Command from "modules/command";

declare module "discord.js" {
  export interface Client {
    commands: Map<string, Command>;

    cache: Map<string, any>;

    db: AceBase | AceBaseClient;
  }
}
