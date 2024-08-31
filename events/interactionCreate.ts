import Bot from "Bot";
import { Events, GuildMember } from "discord.js";
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
      const ctx = await ChatInputInteractionContext(interaction);

      for (const option of interaction.options.data) {
        if (option.value === undefined) continue;

        ctx.options.set(option.name, (option.member as GuildMember | undefined) ?? option.attachment ?? option.value);
      }

      await command.run(ctx);
    } catch (error) {
      console.error(error);
      await interaction.reply("An error occurred while executing this command.");
    }
  });
};
