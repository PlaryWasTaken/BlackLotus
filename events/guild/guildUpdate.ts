import {EmbedBuilder, TextChannel} from "discord.js";
import Event from "../../classes/structs/Event";
export default new Event().setData("guildUpdate", async (client, oldGuild, newGuild) => {
    if (oldGuild.name !== newGuild.name) {
        const guildData = await client.guildManager.fetch(newGuild.id).catch(() => {})
        if (!guildData || !guildData.data.blackLotus.trackNameChanges) return

        const embed = new EmbedBuilder()
            .setTitle('Nome do servidor alterado')
            .setDescription(`O nome do servidor ${oldGuild.name} (Id: ${oldGuild.id}) foi alterado para ${newGuild.name}\n${newGuild.name.length > 25?'Também foi desativado o embedWorthy, pois o nome do servidor é maior que 25 caracteres': guildData.data.blackLotus.embedWorthy?'':'O embedWorthy foi ativado novamente'}`)
            .setColor('#7700ff')
        await guildData.updateName(newGuild.name)
        if (guildData.serverRoleId) {
            const role = await client.blackLotus.roles.fetch(guildData.serverRoleId).catch(() => {})
            if (role) {
                await role.edit({ name: newGuild.name })
            }
        }
        const blackLotus = client.guilds.cache.get('896047806454837278')
        const channel = blackLotus.channels.cache.get(client.configs.logChannel) as TextChannel
        await channel.send({embeds: [embed]})
    }
})