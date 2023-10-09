import Event from "../../classes/structs/Event";
import {EmbedBuilder} from "discord.js";
import Guild from "../../classes/structs/Guild";

export default new Event().setData("blacklotus.guildDelete", async (client, guild: Guild | string, reason: string) => {
    const embed = new EmbedBuilder()
        .setTitle('Servidor removido da black lotus')
        .setDescription(`O servidor ${typeof guild !== 'string' ? `${guild.name} (Id: ${guild.id})`: `com o id ${guild}`} foi removido da black lotus\nRazão:${reason}`)
        .setColor('#ff0000')
        .setTimestamp()
    await client.logChannel.send({ embeds: [embed] }).catch(() => { })
})