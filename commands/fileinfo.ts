import { Attachment, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import Command from "modules/command";
import { niceBytes } from "modules/utils";

const data = new SlashCommandBuilder().setName("fileinfo").setDescription("Analyze a file.");

data.addAttachmentOption((option) => option.setName("file").setDescription("File to analyze").setRequired(true));

export default new Command({
  data,
  async run(ctx) {
    const file = ctx.options.get<Attachment>("file", true);

    const embed = new EmbedBuilder()
      .setTitle(file.name)
      .setAuthor({ name: ctx.author.username, iconURL: ctx.author.displayAvatarURL() })
      .setColor("Random")
      .setFooter({ text: file.contentType ?? "unknown mime type" })
      .setTimestamp()
      .setURL(file.url)
      .addFields({
        name: "Size",
        value: niceBytes(file.size),
      });

    if (file.description) embed.addFields({ name: "Description", value: file.description });

    ctx.send({ embeds: [embed] });
  },
});
