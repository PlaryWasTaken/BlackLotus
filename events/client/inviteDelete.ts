import {ChannelType, Guild, InviteGuild, TextChannel} from "discord.js";
import Event from "../../classes/structs/Event";

import serverModel from "../../models/guildDataModel";

function isGuild(guild: Guild|InviteGuild): guild is Guild {
    return (guild as Guild).rulesChannel !== undefined
}

export default new Event().setData("inviteDelete", async (client, invite) => {
    if (!isGuild(invite.guild)) return
    let serverData = await serverModel.findOne({ id: invite.guild.id})
    if (serverData && invite.url === serverData.blackLotus.invite) {
        client.logger.notice(`Invite da black lotus deletado em ${invite.guild.name} (${invite.guild.id})`)
        client.emit('blacklotus.mainInviteDelete', invite)
        const channel = invite.guild.rulesChannel ||
            invite.guild.channels.cache.find(c => c.type === ChannelType.GuildText && c.position === 0) as TextChannel
        let newInvite = await invite.guild.invites.create(channel, { maxAge: 0, reason: "Invite antigo foi deletado"}).catch(() => {})
        if (!newInvite) return client.logger.notice(`A guilda ${invite.guild.name} com o id ${invite.guild.id} não deu perm pro bot criar invites`)
        serverData.blackLotus.invite = newInvite.url
        await serverData.save()
    }
})