import dayjs from "dayjs";
import guildModel, {GuildDocument} from "#models/guild.js";
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

import discord, {TextChannel} from 'discord.js';
import {ExtendedClient} from "#/types";
export default class Partnerships {
    private client: ExtendedClient;
    public data: GuildDocument;
    private guild: discord.Guild;
    public id: string;
    public channelId: string;
    public mentionId: string;
    public message: string;
    public timer: any;
    public notify: boolean;
    public notified: boolean;
    constructor(client: ExtendedClient, guild: discord.Guild, data?: GuildDocument) {
        this.client = client
        this.data = data
        this.guild = guild
        this.id = guild.id
        if (data && data.modules.partnerships) {
            this.channelId = data.modules.partnerships.channelId
            this.mentionId = data.modules.partnerships.mentionId
            this.message = data.modules.partnerships.message
            this.timer = data.modules.partnerships.timer
            this.notify = data.modules.partnerships.notify
            this.notified = data.modules.partnerships.notified
        }
    }

    canUse() {
        return this.timer < Date.now()
    }

    needsNotify() {
        return this.notify
    }

    checkBeforeSend() {
        return new Promise(async (resolve, reject) => {
            const channel = await this.client.channels.fetch(this.channelId).catch(() => {}) as discord.TextChannel | undefined
            if (!channel) return reject('Chat não encontrado')
            if (!channel.isTextBased()) return  reject('O chat não é um chat de texto')
            if (this.guild.id !== channel.guild.id) return  reject('O chat não é do mesmo servidor')
            const mention = await this.guild.roles.fetch(this.mentionId).catch(() => {})
            if (!mention) return reject('Cargo de menção não encontrado')
            // if (!mention.mentionable) reject('role is mentionable')
            const permissions = channel.permissionsFor(this.client.user)
            if (!permissions.has(discord.PermissionFlagsBits.SendMessages)) return reject('Sem permissão para enviar mensagens')
            resolve(true)
        })
    }

    sendAll() {
        return new Promise(async (resolve, reject) => {
            if (!this.canUse()) reject('cooldown')
            const cu = await this.checkBeforeSend().catch(reject)
            if (!cu) return
            const guilds = await guildModel.find({ "modules.partnerships.channelId": { $exists: true } }).catch(() => {})
            if (!guilds) return reject('No guilds found')
            for (let guild of guilds) {
                if (guild.id === this.id) continue;
                let channel = await this.client.channels.fetch(guild.modules.partnerships.channelId).catch(() => {})
                if (!channel) continue;
                if (!channel.isTextBased()) continue
                await sleep(3000)
                await (channel as TextChannel).send(this.message.replace(/%mencao%/g, `<@&${guild.modules.partnerships.mentionId}>`).replace(/(@here|@everyone)/g, `<@&${guild.modules.partnerships.mentionId}>`).concat(`\n`, `Rep: <@${this.client.user.id}>`))
                    .catch(() => {
                })
            }
            this.data.modules.partnerships.timer = dayjs().add(3, 'day').valueOf()
            this.data.modules.partnerships.notified = false
            await this.data.save()
            resolve(true)
        })
    }

}