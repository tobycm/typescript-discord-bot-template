import Bot from "Bot";
import { Events } from "discord.js";
import { ChatInputInteractionContext } from "modules/context";

export default (bot: Bot) => {
  bot.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) return;

    if (interaction.isAutocomplete()) {
      const command = interaction.client.commands.get(interaction.commandName);
      if (!command?.completion) return;

      return await command.completion(interaction);
    }

    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) return;

    try {
      await command.run(ChatInputInteractionContext(interaction));
    } catch (error) {
      console.error(error);
      await interaction.reply("An error occurred while executing this command.");
    }
  });
};
