import Event from "#structs/Event";

export default new Event().setData("modal.messageChange", async (client, interaction) => {
    const server = await client.blackLotusManager.fetch(interaction.guild.id)
    server.data.modules.partnerships.message = interaction.fields.getTextInputValue('messageInput')
    await server.data.save()
    await interaction.reply({ ephemeral: true, content: `Troquei a sua mensagem de parceria com sucesso!`})
})