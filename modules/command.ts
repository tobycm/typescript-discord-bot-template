import { AutocompleteInteraction, SlashCommandBuilder } from "discord.js";
import { BaseContext } from "./context";

interface CommandOptions {
  data: SlashCommandBuilder;

  run: (context: BaseContext) => any | Promise<any>;
  completion?: (interaction: AutocompleteInteraction) => any | Promise<any>;
}

export default class Command {
  constructor(options: CommandOptions) {
    this.data = options.data;
    this.run = options.run;
    this.completion = options.completion;
  }

  data: SlashCommandBuilder;
  run: (context: BaseContext) => any | Promise<any>;
  completion?: (interaction: AutocompleteInteraction) => any | Promise<any>;
}
