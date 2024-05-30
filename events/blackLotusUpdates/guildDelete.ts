import Event from '../../classes/structs/Event'
export default new Event().setData('guildDelete', async (client, guild) => {
    if (await client.blackLotusManager.isPartOfBlackLotus(guild.id)) {
        await client.blackLotusManager.delete(guild.id)
    }
})