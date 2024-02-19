import dayjs from "dayjs";
import guildModel from "../../models/guildDataModel";
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

import discord from 'discord.js';
import {ExtendedClient} from "../../types";
export default class Partnerships {
    private client: any; // TODO
    public data: any;
    private guild: any;
    public id: string;
    public channelId: string;
    public mentionId: string;
    public message: string;
    public timer: any;
    public notify: boolean;
    public notified: boolean;
    constructor(client: ExtendedClient, guild, data) {
        this.client = client
        this.data = data
        this.guild = guild
        this.id = guild.id
        if (!data) data = {}
        if (!data.partnerships) data.partnerships = {}
        this.channelId = data.partnerships?.channelId
        this.mentionId = data.partnerships?.mentionId
        this.message = data.partnerships?.message
        this.timer = data.partnerships?.timer
        this.notify = data.partnerships?.notify
        this.notified = data.partnerships?.notified
    }

    canUse() {
        return this.timer < Date.now()
    }

    needsNotify() {
        return this.notify
    }

    checkBeforeSend() {
        return new Promise(async (resolve, reject) => {
            const channel = await this.client.channels.fetch(this.channelId).catch(() => {})
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
            const guilds = await guildModel.find({ "partnerships.channelId": { $exists: true } }).catch(() => {})
            if (!guilds) return reject('No guilds found')
            for (let guild of guilds) {
                if (guild.id === this.id) continue;
                let channel = await this.client.channels.fetch(guild.partnerships.channelId).catch(() => {})
                if (!channel) continue;
                if (!channel.isTextBased()) continue
                await sleep(3000)
                await channel.send(this.message.replace(/%mencao%/g, `<@&${guild.partnerships.mentionId}>`).replace(/(@here|@everyone)/g, `<@&${guild.partnerships.mentionId}>`).concat(`\n`, `Rep: <@${this.client.user.id}>`))
                    .catch(() => {
                })
            }
            this.data.partnerships.timer = dayjs().add(3, 'day').valueOf()
            this.data.partnerships.notified = false
            await this.data.save()
            resolve(true)
        })
    }

}