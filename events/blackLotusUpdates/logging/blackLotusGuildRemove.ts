import Event from '#structs/Event'
import {EmbedBuilder} from "discord.js";
export default new Event().setData('blacklotus.guildDelete', async (client, id, reason) => {
    const embed = new EmbedBuilder()
        .setTitle(`Servidor ${id} removido`)
        .setColor('#ff8080')
        .setDescription(`O servidor ${id} foi removido da black lotus, motivo: ${reason}`)
    await client.logChannel.send({embeds: [embed]})
})