import Event from '../../classes/structs/Event'
export default new Event().setData('guildDelete', async (client, guild) => {
    client.guildManager.delete(guild.id, "Removeu o bot do servidor").catch(() => {
    })
})