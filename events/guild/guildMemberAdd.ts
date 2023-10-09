import Discord from 'discord.js'
import Event from '../../classes/structs/Event.js'
export default new Event().setData("guildMemberAdd", async (client, member) => {
    const guild = member.guild
    let guildData = await client.guildManager.fetch(guild.id).catch(() => { })
    if (!guildData) return
    if (!guildData.data || !guildData.data.blackLotus.constelation || !guildData.data.blackLotus.trackGrowth) return
    const constelation = await guildData.constelation.fetch()
    if (constelation && constelation.name !== guildData.data.blackLotus.constelation.name) {
        const blackLotus = client.guilds.cache.get('896047806454837278')
        if (!guildData.data.blackLotus.representant) {
            const channel = blackLotus.channels.cache.get(client.configs.logChannel)
            const embed = new Discord.EmbedBuilder()
                .setTitle('Representante não encontrado/não existe')
                .setDescription(`O servidor ${guild.name} (Id: ${guild.id}) não tem representante e deve mudar de constelacão (Indo de: ${guildData.data.blackLotus.constelation.name} para ${constelation.name}), por favor, adicione um representante para o servidor${await blackLotus.members.fetch(guild.ownerId).catch(() => { return undefined})?`\nEu achei o dono do servidor aqui: <@${guild.ownerId}>`:'O dono do servidor não está aqui, descobre sozinho sobre quem deve ser o representante'}`)
                .setColor('#ff0000')
            if (channel.isTextBased()) {
                await channel.send({ embeds: [embed] })
            }
            return
        }
        if (!guildData.data.blackLotus.role) {
            const channel = blackLotus.channels.cache.get(client.configs.logChannel)
            const embed = new Discord.EmbedBuilder()
                .setTitle('Cargo do servidor não encontrado/não existe')
                .setDescription(`O servidor ${guild.name} (Id: ${guild.id}) não tem um cargo configurado e deve mudar de constelacão (Indo de: ${guildData.data.blackLotus.constelation.name} para ${constelation.name}), por favor, adicione um cargo para o servidor`)
                .setColor('#ff0000')
            if (channel.isTextBased()) {
                await channel.send({ embeds: [embed] })
            }
            return
        }
        const representant = await blackLotus.members.fetch(guildData.data.blackLotus.representant).catch(() => { })
        if (!guildData || !representant) return
        const channel = blackLotus.channels.cache.get(client.configs.logChannel)
        const embed = new Discord.EmbedBuilder()
            .setTitle('Constelação alterada')
            .setDescription(`O servidor ${guild.name} (Id: ${guild.id}) mudou de constelação (Indo de: ${guildData.data.blackLotus.constelation.name} para ${constelation.name})`).setColor('#6a00ff').setTimestamp()
        if (channel.isTextBased()) {
            await channel.send({ embeds: [embed] })
        }
        await guildData.constelation.updateConstellation()
    }
})
