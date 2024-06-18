import {
  SlashCommandBuilder,
  PermissionFlagsBits,
  AttachmentBuilder,
  EmbedBuilder,
} from "discord.js";
import Command from "../../classes/structs/Command";
import SyndicateEmbed from "#structs/SyndicateEmbed";

export default new Command({
  command: new SlashCommandBuilder()
    .setName("send")
    .setDescription(".")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand.setName("lotus").setDescription("Envia a embed da black lotus"),
    )
    .addSubcommand((subcommand) =>
      subcommand.setName("syndicate").setDescription("Envia a embed da black syndicate"),
    ),
  guilds: ["896047806454837278"],
  async run({ client, interaction }) {
    switch (interaction.options.getSubcommand()) {
      case "lotus":
        const attachment = new AttachmentBuilder(
          "https://cdn.discordapp.com/attachments/920464336978337872/1116842995635982416/aaaa.png",
        ); // https://cdn.discordapp.com/attachments/920464336978337872/1079928972038635520/black_lotus_2.png
        await client.mainEmbed.loadInfo();
        const embed = new EmbedBuilder(await client.mainEmbed.getEmbedJson());
        const message = await interaction.channel.send({ embeds: [embed] });
        client.mainEmbed.message.msgId = message.id;
        client.mainEmbed.message.channelId = message.channel.id;
        client.mainEmbed.message.guildId = message.guild.id;
        await client.mainEmbed.message.save();
        await interaction.reply({
          ephemeral: true,
          content: "Embed enviada com sucesso",
        });
        break;
      case "syndicate": {
        const syndicateEmbed = new SyndicateEmbed(client);
        await syndicateEmbed.loadInfo();
        const embed = new EmbedBuilder(await syndicateEmbed.getEmbedJson());
        const message = await interaction.channel.send({ embeds: [embed] });
        syndicateEmbed.message.msgId = message.id;
        syndicateEmbed.message.channelId = message.channel.id;
        syndicateEmbed.message.guildId = message.guild.id;
        await syndicateEmbed.message.save();
        await interaction.reply({
          ephemeral: true,
          content: "Embed enviada com sucesso",
        });
      }
    }
  },
});
