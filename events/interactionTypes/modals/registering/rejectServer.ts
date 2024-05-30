import Event from "#structs/Event";
import {EmbedBuilder} from "discord.js";

export default new Event().setData("modal.rejectServer", async (client, interaction, args) => {
    const guild = await client.guilds.fetch(args[0]).catch(() => {})
    if (!guild) return interaction.reply({ephemeral: true, content: `Tente novamente, o servidor não foi encontrado`})
    const embed = new EmbedBuilder()
        .setTitle(`Seu servidor ${guild.name} foi rejeitado`)
        .setColor('#ff7e7e')
        .setDescription(`Motivo: ${interaction.fields.getTextInputValue('rejectServerReason')}`)
    const originalEmbed = new EmbedBuilder(interaction.message.embeds[0].data).setColor('#ff7e7e').setDescription(`Motivo: ${interaction.fields.getTextInputValue('rejectServerReason')}`)

    const user = await client.users.fetch(args[1]).catch(() => {})
    if (user) await user.send({embeds: [embed]}).catch(() => {})

    await interaction.reply({ embeds: [embed], components: [] })
    await interaction.message.edit({ embeds: [originalEmbed], components: [] })
    client.emit("blacklotus.serverReject")
})