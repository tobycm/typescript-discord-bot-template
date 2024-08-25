import { GuildMember, SlashCommandBuilder, userMention } from "discord.js";
import Command from "modules/command";

const data = new SlashCommandBuilder().setName("cunny").setDescription("Time to cunny a user.");

data.addUserOption((option) => option.setName("target").setDescription("User to cunny"));

export default new Command({
  data,
  async run(ctx) {
    const target = ctx.options.get<GuildMember>("target");

    ctx.send(userMention((target ?? ctx.author).id) + " 🩷");
  },
});
