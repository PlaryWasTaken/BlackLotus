import Event from "../../classes/structs/Event";
import Guild from "../../classes/structs/Guild";
import {EmbedBuilder} from "discord.js";

export default new Event().setData("blackLotus.guildDeleteComplete", async (client, guild: Guild) => {
    const rep = await client.users.fetch(guild.representant).catch(() => {})
    if (!rep) return
    const embed = new EmbedBuilder()
        .setTitle(`Servidor ${guild.displayedName} removido`)
        .setColor('#ff8080')
        .setDescription(`O seu servidor ${guild.displayedName} foi removido da black lotus, você está recebendo esta ultima notificacão pois você era o representante do servidor`)
        .setFooter({
            text: `Sentiremos sua falta ${rep.username}`,
        })
    await rep.send({embeds: [embed]}).catch(() => {})
})