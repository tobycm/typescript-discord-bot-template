import { Attachment, GuildMember, SlashCommandBuilder, userMention } from "discord.js";
import Command from "modules/command";

const data = new SlashCommandBuilder().setName("cunny").setDescription("Time to cunny a user.");

data.addUserOption((option) => option.setName("target").setDescription("User to cunny"));
data.addAttachmentOption((option) => option.setName("file").setDescription("File to forward to bro :D"));

export default new Command({
  data,
  async run(ctx) {
    const target = ctx.options.get<GuildMember>("target");
    const file = ctx.options.get<Attachment>("file");

    ctx.send({
      content: userMention((target ?? ctx.author).id) + " 🩷",
      files: file ? [file] : undefined,
    });

    ctx.reply({
      content: ":3",
      ephemeral: true,
    });
  },
});
