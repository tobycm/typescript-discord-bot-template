import { AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

interface CommandOptions {
  data: SlashCommandBuilder;

  run: (interaction: ChatInputCommandInteraction) => any | Promise<any>;
  completion?: (interaction: AutocompleteInteraction) => any | Promise<any>;
}

export default class Command {
  constructor(options: CommandOptions) {
    this.data = options.data;
    this.run = options.run;
    this.completion = options.completion;
  }

  data: SlashCommandBuilder;
  run: (interaction: ChatInputCommandInteraction) => any | Promise<any>;
  completion?: (interaction: AutocompleteInteraction) => any | Promise<any>;
}
