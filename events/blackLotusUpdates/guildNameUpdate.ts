import {EmbedBuilder} from "discord.js";
import Event from "../../classes/structs/Event";
export default new Event().setData("guildUpdate", async (client, oldGuild, newGuild) => {
    if (oldGuild.name !== newGuild.name) {
        const guildData = await client.blackLotusManager.fetch(newGuild.id).catch(() => {})
        const embed = new EmbedBuilder()

        if (guildData && guildData.data.modules.blackLotus.trackNameChanges) {
            embed
                .setTitle('Nome do servidor alterado (Black)')
                .setDescription(`O nome do servidor ${oldGuild.name} (Id: ${oldGuild.id}) foi alterado para ${newGuild.name}\n${newGuild.name.length > 25?'Também foi desativado o embedWorthy, pois o nome do servidor é maior que 25 caracteres': guildData.data.modules.blackLotus.embedWorthy?'':'O embedWorthy foi ativado novamente'}`)
                .setColor('#7700ff')
            await guildData.updateName(newGuild.name)
            if (guildData.serverRoleId) {
                const role = await client.blackLotus.roles.fetch(guildData.serverRoleId).catch(() => {})
                if (role) {
                    await role.edit({ name: newGuild.name })
                }
            }
        }
        const syndicateData = await client.syndicateManager.fetch(newGuild.id).catch(() => {})
        if (syndicateData && syndicateData.data.modules.syndicate.trackNameChanges) {
            embed
                .setTitle('Nome do servidor alterado (Syndicate)')
                .setDescription(`O nome do servidor ${oldGuild.name} (Id: ${oldGuild.id}) foi alterado para ${newGuild.name}\n${newGuild.name.length > 25?'Também foi desativado o embedWorthy, pois o nome do servidor é maior que 25 caracteres': syndicateData.data.modules.syndicate.embedWorthy?'':'O embedWorthy foi ativado novamente'}`)
                .setColor('#7700ff')
            await syndicateData.updateName(newGuild.name)
        }
        await client.logChannel.send({embeds: [embed]})
    }
})