

import Event from '../../classes/structs/Event.js'
import {EmbedBuilder, TextChannel} from "discord.js";




export default new Event().setData("guildMemberRemove",async (client, member) => {
    if (member.guild.id === client.blackLotus.id) {
        const results = await client.blackLotusManager.fetchByKV({"modules.blackLotus.representant": member.id}).catch(() => {})
        if (!results || results.length === 0) return
        const embed = new EmbedBuilder()
            .setTitle('Representante saiu')
            .setDescription(`O representante ${member.displayName} (Id: ${member.id}) saiu do servidor`)
            .setColor('#ff7f7f')
            .setTimestamp()
        await client.logChannel.send({ embeds: [embed] })
        for (const guild of results) { // Delete all servers where the member is a representant
            client.emit('blackLotus.guildRepresentantLeft', member, guild)
            await guild.delete("Representante saiu do servidor da black lotus")
        }

        // Find all servers where the member is part of the staff team and remove him from the staffs array
        const data = await client.blackLotusManager.fetchByKV({ "modules.blackLotus.staffs": {$elemMatch: {id: member.id}} })
        if (!data) return
        for (const server of data) {
            await server.removeStaff(member.id)
        }
        client.emit('blackLotus.representantLeft', member)
    }
})