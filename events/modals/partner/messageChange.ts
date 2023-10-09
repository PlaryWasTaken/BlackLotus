import Event from "../../../classes/structs/Event";

export default new Event().setData("modal.messageChange", async (client, interaction) => {
    const server = await client.guildManager.fetch(interaction.guild.id)
    server.data.partnerships.message = interaction.fields.getTextInputValue('messageInput')
    await server.data.save()
    await interaction.reply({ ephemeral: true, content: `Troquei a sua mensagem de parceria com sucesso!`})
})