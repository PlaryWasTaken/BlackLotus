import {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  userMention as k
} from "discord.js";
import Event from "#structs/Event";

export default new Event().setData(
  "button.rejectServer",
  async (client, interaction, args) => {
    const divPermRoleId = "1154855047625195530";

    const central = client.blackLotus;
    const permRole = central.roles.cache.get(divPermRoleId);

    const interactionUser = await central.members.fetch(
      interaction.user.id
    );

    const hasPermission = interactionUser.roles.cache.some(
      (role) => role.position > permRole.position
    );

    if (hasPermission) {
      const modal = new ModalBuilder()
        .setCustomId(
          "rejectServer-" +
            args[0] +
            "-" +
            args[2] +
            "-" +
            interaction.message.id +
            "-" +
            args[3] +
            "-" +
            args[1]
        )
        .setTitle("Rejeitar candidatura");
      const modalRow = new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
          .setCustomId("rejectServerReason")
          .setRequired(false)
          .setStyle(TextInputStyle.Paragraph)
          .setLabel("Forneça um motivo:"),
      ]);
      modal.addComponents(modalRow);
      await interaction.showModal(modal);
      /*
    const embed = new discord.EmbedBuilder(interaction.message.embeds[0].data).setColor('#ff0000')
    await interaction.update({ embeds: [embed], components: [] })
    client.emit("blacklotus.serverReject")
     */
    } else {
      interaction.reply({
        ephemeral: true,
        content: `<:warn:1251149443869184052> | ${k(
          interaction.user.id
        )} você não tem permissão para executar essa interação! *Caso acredite que isso seja um erro, entre em contato com o suporte.*`,
      });
    }
  }
);
