import Event from "../../classes/structs/Event";
import guildModel from "../../models/guildDataModel";


module.exports = new Event().setData("tick", async (client) => {
    const guilds = await guildModel.find({"partnerships.notify": true, "partnerships.notified": false}).catch(() => {
    })
    if (!guilds) return;
    for (let guild of guilds) {
        let guildData = await client.guildManager.fetch(guild.id).catch(() => {
        })
        if (!guildData) continue;
        if (!guildData.partnerships.canUse()) continue;
        if (guildData.partnerships.notified) continue;
        const rep = await client.users.fetch(guildData.representant).catch(() => {
        })
        if (!rep) continue;
        await rep.send(`Hey! Já se passaram os 3 dias desde que você postou sua parceria!\n\nIsso quer dizer que agora você pode utilizar novamente o comando <\/partner enviar:1002748349767766108> no servidor ${guildData.data.blackLotus.displayName}!\n\n🪷 Qualquer dúvida que tiver basta acessar o canal de ajuda 🪷`).catch(() => {
        })
        client.logger.child({ service: "Partnership Notify", hexColor: "#bffabf"}).notice('Notificação de parceria enviada para ' + rep.tag)
        guildData.partnerships.notified = true
        guildData.data.partnerships.notified = true
        await guildData.data.save()
    }
})