import Discord from 'discord.js'
import Event from '../../classes/structs/Event.js'
import BlackLotusGuild from "#structs/BlackLotusGuild";

export default new Event().setData("guildMemberAdd", async (client, member) => {
    const guild = member.guild
    let guildData = await client.blackLotusManager.fetch(guild.id).catch(() => {
    })
    if (!guildData) return
    if (!guildData.data || !guildData.data.modules.blackLotus.constellation || !guildData.data.modules.blackLotus.trackGrowth) return
    const constellation = await guildData.constellation.fetch().catch(() => {
        client.logger.debug('Constellation unable to be fetched')
    })
    if (constellation && constellation.name !== guildData.data.modules.blackLotus.constellation.name) {
        if (!guildData.data.modules.blackLotus.representant) {
            const embed = new Discord.EmbedBuilder()
                .setTitle('Representante não encontrado/não existe')
                .setDescription(`O servidor ${guild.name} (Id: ${guild.id}) não tem representante e deve mudar de constelacão (Indo de: ${guildData.data.modules.blackLotus.constellation.name} para ${constellation.name}), por favor, adicione um representante para o servidor${await client.blackLotus.members.fetch(guild.ownerId).catch(() => {
                    return undefined
                }) ? `\nEu achei o dono do servidor aqui: <@${guild.ownerId}>` : 'O dono do servidor não está aqui, descobre sozinho sobre quem deve ser o representante'}`)
                .setColor('#ff0000')
            await client.logChannel.send({embeds: [embed]})
            return
        }
        if (!guildData.data.modules.blackLotus.role) {
            const embed = new Discord.EmbedBuilder()
                .setTitle('Cargo do servidor não encontrado/não existe')
                .setDescription(`O servidor ${guild.name} (Id: ${guild.id}) não tem um cargo configurado e deve mudar de constelacão (Indo de: ${guildData.data.modules.blackLotus.constellation.name} para ${constellation.name}), por favor, adicione um cargo para o servidor`)
                .setColor('#ff0000')
            await client.logChannel.send({embeds: [embed]})
            return
        }
        const representant = await client.blackLotus.members.fetch(guildData.data.modules.blackLotus.representant).catch(() => {
        })
        if (!guildData || !representant) return
        const embed = new Discord.EmbedBuilder()
            .setTitle('Constelação alterada')
            .setDescription(`O servidor ${guild.name} (Id: ${guild.id}) mudou de constelação (Indo de: ${guildData.data.modules.blackLotus.constellation.name} para ${constellation.name})`).setColor('#6a00ff').setTimestamp()

        await guildData.constellation.updateConstellation().then(async () => {
            await client.logChannel.send({embeds: [embed]})
        }).catch(async  () => {
            const embed = new Discord.EmbedBuilder()
                .setTitle('Erro ao atualizar constelação')
                .setDescription(`O servidor ${guild.name} (Id: ${guild.id}) mudou de constelação (Indo de: ${(guildData as BlackLotusGuild).data.modules.blackLotus.constellation.name} para ${constellation.name}), mas houve um erro ao atualizar a constelação`).setColor('#ff0000').setTimestamp()
            await client.logChannel.send({embeds: [embed]})
        })
    }
})