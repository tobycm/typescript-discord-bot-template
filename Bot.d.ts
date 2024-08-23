import { AceBase } from "acebase";
import Command from "modules/command";

declare module "discord.js" {
  export interface Client {
    commands: Map<string, Command>;

    db: AceBase;
  }
}
