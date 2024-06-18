import discord from "discord.js";
import Command from "#structs/Command";
const ownerID = "177840117057191937";
export default new Command({
  command: new discord.SlashCommandBuilder()
    .setName("sugerir")
    .setDescription("Sugerir um novo comando para o bot")
    .addSubcommand((subcommand) =>
      subcommand
        .setName("recurso")
        .setDescription(
          "Enviar uma sugestão de algo que deveria ser adicionado ao bot"
        )
        .addStringOption((option) =>
          option
            .setName("sugestao")
            .setDescription("Sua sugestão")
            .setRequired(true)
            .setMinLength(15)
            .setMaxLength(1000)
        )
    ),
  async run({ interaction }) {
    const sugestao = interaction.options.getString("sugestao");
    let owner = await interaction.guild.members.fetch(ownerID).catch(() => {});
    if (!owner)
      return interaction.reply({
        ephemeral: true,
        content: `Dc ta sendo esquisito`,
      });
    const embed = new discord.EmbedBuilder()
      .setTitle(
        `${interaction.user.tag} enviou uma sugestão! (Id: ${interaction.user.id})`
      )
      .setDescription(`Sugestão: ${sugestao}`)
      .setColor("#aa00ff");
    await owner.send({ embeds: [embed] });
    await interaction.reply({
      ephemeral: true,
      content: `Sugestão enviada com sucesso! (Abuso deste sistema pode levar a ban.)`,
    });
  },
});
