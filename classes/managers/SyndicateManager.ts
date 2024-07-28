import {ExtendedClient} from "#/types";

import SyndicateGuild from "#structs/SyndicateGuild";
import GuildModel, {GuildDocument} from '#models/guild.js';
export default class SyndicateManager {
    private readonly client: ExtendedClient;
    constructor(client: ExtendedClient) {
        this.client = client
    }
    fetch(id: string): Promise<SyndicateGuild> {
        return new Promise(async (resolve, err) => {
            const guild = await this.client.guilds.fetch(id).catch(err)
            const guildData = await GuildModel.findOne({ id: id, "modules.syndicate.joinedAt": { $exists: true }, $or: [{blacklisted: false}, {blacklisted: {$exists: false}}] })
            if (!guildData) return err('Registration not found')
            if (!guild) return
            resolve(new SyndicateGuild(id, this.client, guild, guildData as any)) // Im not going to do the type gymnastics that needs to be done so this typechecks
        })
    }
    isPartOfBlackSyndicate(id: string): Promise<boolean> {
        return new Promise(async (resolve) => {
            const guildData = await GuildModel.findOne({ id: id, "modules.syndicate.joinedAt": { $exists: true }, $or: [{blacklisted: false}, {blacklisted: {$exists: false}}] })
            if (!guildData) return resolve(false)
            resolve(true)
        })
    }
    create({ id, repId, invite }: {
        id: string,
        repId: string,
        invite: string
    }): Promise<SyndicateGuild> {
        return new Promise(async (resolve, err) => {
            const guild = await this.client.guilds.fetch(id).catch(err)
            if (!guild) return err('Guild not found')
            const guildData = await GuildModel.findOne({ id: id, "modules.syndicate.joinedAt": { $exists: true }, $or: [{blacklisted: false}, {blacklisted: {$exists: false}}]   })
            if (guildData) return err('Registration already exists')
            const profile = await GuildModel.create({
                id: id,
                modules: {
                    syndicate: {
                        displayName: guild.name,
                        invite: `https://discord.gg/${guild.vanityURLCode || invite}`,
                        representant: repId,
                        embedWorthy: guild.name.length < 25,
                        joinedAt: Date.now()
                    }
                }
            })
            await profile.save()
            const guildHandle = new SyndicateGuild(id, this.client, guild, profile as any)
            this.client.emit('syndicate.newGuild', guildHandle)
            resolve(guildHandle)
        })
    }
    delete(id: string, reason: string = 'Guilda foi deletada, não estava com o bot (Razão padrão)'): Promise<this> {
        return new Promise(async (resolve, err) => {
            const guildData = await GuildModel.findOne({ id: id, "modules.syndicate.joinedAt": { $exists: true }, $or: [{blacklisted: false}, {blacklisted: {$exists: false}}]   })
            if (!guildData) return err('Registration not found')
            const guildObj = await this.client.guilds.fetch(id).catch(err)
            if (!guildObj) {
                this.client.logger.info(`Guild ${id} was not found when trying to delete it, this means the guild has removed the bot`)
                const role = await this.client.blackLotus.roles.fetch(guildData.modules.syndicate.role).catch(() => {})
                if (role) await role.delete().catch(() => {})
                await GuildModel.findByIdAndDelete(guildData._id)
                this.client.emit('syndicate.guildDeleteIncomplete', id, reason)
                this.client.emit('syndicate.guildDelete', id, reason)
                return resolve(this)
            }
            const guild = new SyndicateGuild(id, this.client, guildObj, guildData as any)
            const result = await guild.delete(reason).catch((error) => {
                err(error)
            })
            if (!result) return
            this.client.emit('syndicate.guildDelete', id, reason)
            resolve(this)
        })
    }
    fetchByKV(filter: Object): Promise<Array<SyndicateGuild>> {
        return new Promise(async (resolve) => {
            filter["modules.syndicate.joinedAt"] = { $exists: true } // This is to make sure we only get guilds that have the syndicate module
            if (!filter["blacklisted"] && !filter["$or"]) filter["$or"] = [{blacklisted: false}, {blacklisted: {$exists: false}}] // This is to make sure we only get guilds that are not blacklisted, unless the filter specifies otherwise
            const guildData = await GuildModel.find(filter)
            if (!guildData || guildData.length === 0) return []
            const guilds = []
            for (const guild of guildData) {
                const guildObj = await this.client.guilds.fetch(guild.id).catch(() => {})
                if (!guildObj) {
                    this.client.logger.warning(`Guild ${guild.id} was not found when trying to fetch it`)
                    continue
                }
                guilds.push(new SyndicateGuild(guild.id, this.client, guildObj, guild as any))
            }
            resolve(guilds)
        })
    }
    fetchAllData(): Promise<Array<GuildDocument>> {
        return new Promise(async (resolve) => {
            const guildData = await GuildModel.find({ "modules.syndicate.joinedAt": { $exists: true }, $or: [{blacklisted: false}, {blacklisted: {$exists: false}}]   })
            if (!guildData || guildData.length === 0) return []
            resolve(guildData as GuildDocument[])
        })
    }
}