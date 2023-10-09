import {ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle} from "discord.js";
import Event from "../../classes/structs/Event";

export default new Event().setData("button.rejectServer", async (client, interaction, args) => {
    const modal = new ModalBuilder()
        .setCustomId('rejectServer-' + args[0] + '-' + args[2] + '-' + interaction.message.id)
        .setTitle('Rejeitar servidor')
    const modalRow = new ActionRowBuilder<TextInputBuilder>().addComponents([
        new TextInputBuilder()
            .setCustomId('rejectServerReason')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setLabel('Motivo')
    ])
    modal.addComponents(modalRow)
    await interaction.showModal(modal)
    /*
    const embed = new discord.EmbedBuilder(interaction.message.embeds[0].data).setColor('#ff0000')
    await interaction.update({ embeds: [embed], components: [] })
    client.emit("blacklotus.serverReject")
     */
})