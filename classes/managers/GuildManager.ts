import {ExtendedClient} from "#/types";

import GuildModel from '#models/guild.js';
import Guild from "#structs/Guild";
import {Logger} from "winston";
export default class GuildManager {
    private readonly client: ExtendedClient;
    private logger: Logger;
    constructor(client: ExtendedClient) {
        this.client = client
        this.logger = client.logger.child({service: 'GuildManager', hexColor: '#ffc9ff'})
    }
    fetch(id: string): Promise<Guild> {
        return new Promise(async (resolve, err) => {
            const guild = await this.client.guilds.fetch(id).catch(err)
            const guildData = await GuildModel.findOne({ id: id })
            if (!guildData) return err('Registration not found')
            if (!guild) return
            resolve(new Guild(id, this.client, guild, guildData as any)) // Im not going to do the type gymnastics that needs to be done so this typechecks
        })
    }
    create({ id }: {
        id: string
    }): Promise<Guild> {
        return new Promise(async (resolve, err) => {
            const guild = await this.client.guilds.fetch(id).catch(err)
            if (!guild) return err('Guild not found')
            const guildData = await GuildModel.findOne({ id: id })
            if (guildData) return err('Registration already exists')
            const profile = await GuildModel.create({
                id: id,
                blacklisted: false,
            })
            await profile.save()
            const guildHandle = new Guild(id, this.client, guild, profile as any)
            resolve(guildHandle)
        })
    }
    delete(id: string): Promise<this> {
        return new Promise(async (resolve, err) => {
            const guildData = await GuildModel.findOne({ id: id })
            if (!guildData) return err('Registration not found')
            const guildObj = await this.client.guilds.fetch(id).catch(err)
            if (!guildObj) {
                this.logger.info(`Guild ${id} was not found when trying to delete it, this means the guild has removed the bot`)
                await GuildModel.findByIdAndDelete(guildData._id)
                return resolve(this)
            }
            const guild = new Guild(id, this.client, guildObj, guildData as any)
            const result = await guild.delete().catch((error) => {
                err(error)
            })
            if (!result) return
            resolve(this)
        })
    }
    fetchByKV(filter: Object): Promise<Array<Guild>> {
        return new Promise(async (resolve) => {
            const guildData = await GuildModel.find(filter)
            if (!guildData || guildData.length === 0) return []
            const guilds = []
            for (const guild of guildData) {
                const guildObj = await this.client.guilds.fetch(guild.id).catch(() => {})
                if (!guildObj) {
                    this.logger.warning(`Guild ${guild.id} was not found when trying to fetch it by K/V`)
                    continue
                }
                guilds.push(new Guild(guild.id, this.client, guildObj, guild as any))
            }
            resolve(guilds)
        })
    }
}