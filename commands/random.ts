import { inlineCode, SlashCommandBuilder } from "discord.js";
import Command from "modules/command";

const data = new SlashCommandBuilder().setName("random").setDescription("Get a random number.");

data.addIntegerOption((option) => option.setName("min").setDescription("Minimum. Default is 1 (inclusive)"));
data.addIntegerOption((option) => option.setName("max").setDescription("Maximum. Default is 100 (inclusive)"));

export default new Command({
  data,
  async run(ctx) {
    const min = ctx.options.get<number>("min") ?? 1;
    const max = ctx.options.get<number>("max") ?? 100;

    if (min > max) {
      ctx.reply("The minimum value cannot be greater than the maximum value.");
      return;
    }

    const random = Math.floor(Math.random() * (max - min + 1) + min);
    ctx.reply({ content: `Here is your random number: ${inlineCode(random.toString())}` });
  },
});
