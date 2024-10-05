

import Event from '../../classes/structs/Event.js'
import {EmbedBuilder, TextChannel} from "discord.js";




export default new Event().setData("guildMemberRemove",async (client, member) => {
    if (member.guild.id === client.blackLotus.id) {
        /**/
        const results = await client.blackLotusManager.fetchByKV({"modules.blackLotus.representant": member.id}).catch(() => {})
        if (results && results.length > 0) {
            const embed = new EmbedBuilder()
                .setTitle('Representante saiu (Black)')
                .setDescription(`O representante ${member.displayName} (Id: ${member.id}) saiu do servidor`)
                .setColor('#ff7f7f')
                .setTimestamp()
            await client.logChannel.send({ embeds: [embed] })
            for (const guild of results) { // Delete all servers where the member is a representant
                client.emit('blackLotus.guildRepresentantLeft', member, guild)
                await guild.delete("Representante saiu do servidor da black lotus")
            }
        }
        /* BlackLotus Checks */
        /* Syndicate Checks */
        const syndicateResults = await client.syndicateManager.fetchByKV({"modules.syndicate.representant": member.id}).catch(() => {})
        if (syndicateResults && syndicateResults.length > 0) {
            const embed = new EmbedBuilder()
                .setTitle('Representante saiu (Syndicate)')
                .setDescription(`O representante ${member.displayName} (Id: ${member.id}) saiu do servidor`)
                .setColor('#ff7f7f')
                .setTimestamp()
            await client.logChannel.send({ embeds: [embed] })
            for (const guild of syndicateResults) { // Delete all servers where the member is a representant
                client.emit('syndicate.guildRepresentantLeft', member, guild)
                await guild.delete("Representante saiu do servidor da syndicate")
            }
        }
        /**/
        // Remove staff from all servers
        const blackLotusGuilds = await client.blackLotusManager.fetchByKV({ "modules.blackLotus.staffs": {$elemMatch: {id: member.id}} })
        if (blackLotusGuilds) {
            for (const server of blackLotusGuilds) {
                await server.removeStaff(member.id)
            }
        }
        const syndicateGuilds = await client.syndicateManager.fetchByKV({ "modules.syndicate.staffs": {$elemMatch: {id: member.id}} })
        if (syndicateGuilds) {
            for (const server of syndicateGuilds) {
                await server.removeStaff(member.id)
            }
        }
    }
})