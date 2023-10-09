import {ExtendedClient} from "../../types";

import Guild from '../structs/Guild';
import Constelation from '../structs/Constellation';
import GuildModel from '../../models/guildDataModel';
export default class GuildManager {
    private readonly client: ExtendedClient;
    constructor(client: ExtendedClient) {
        this.client = client
    }
    fetch(id: string): Promise<Guild> {
        return new Promise(async (resolve, err) => {
            const guild = await this.client.guilds.fetch(id).catch(err)
            const guildData = await GuildModel.findOne({ id: id }).populate('blackLotus.constelation')
            if (!guildData) return err('Registration not found')
            if (!guild) return
            resolve(new Guild(id, this.client, guild, guildData as any)) // Im not going to do the type gymnastics that needs to be done so this typechecks
        })
    }
    create({ id, repId, invite }: {
        id: string,
        repId: string,
        invite: string
    }): Promise<Guild> {
        return new Promise(async (resolve, err) => {
            const guild = await this.client.guilds.fetch(id).catch(err)
            if (!guild) return err('Guild not found')
            const guildData = await GuildModel.findOne({ id: id })
            if (guildData) return err('Registration already exists')
            const ConstelationHandle = new Constelation(id, this.client, guild, undefined)
            const profile = await GuildModel.create({
                id: id,
                blackLotus: {
                    displayName: guild.name,
                    invite: `https://discord.gg/${guild.vanityURLCode || invite}`,
                    representant: repId,
                    constelation: await ConstelationHandle.fetch(),
                    embedWorthy: guild.name.length < 25
                }
            })
            await profile.save()
            const guildHandle = new Guild(id, this.client, guild, profile as any)
            this.client.emit('blacklotus.newGuild', guildHandle)
            resolve(guildHandle)
        })
    }
    delete(id: string, reason: string = 'Guilda foi deletada, não estava com o bot (Razão padrão)'): Promise<this> {
        return new Promise(async (resolve, err) => {
            const guildData = await GuildModel.findOne({ id: id }).populate('blackLotus.constelation')
            if (!guildData) return err('Registration not found')
            const guildObj = await this.client.guilds.fetch(id).catch(err)
            if (!guildObj) {
                this.client.logger.info(`Guild ${id} was not found when trying to delete it`)
                const role = await this.client.blackLotus.roles.fetch(guildData.blackLotus.role).catch(() => {})
                if (role) await role.delete().catch(() => {})
                await guildData.delete()
                this.client.emit('blackLotus.guildDeleteIncomplete', id, reason)
                this.client.emit('blacklotus.guildDelete', id, reason)
                return resolve(this)
            }
            const guild = new Guild(id, this.client, guildObj, guildData as any)
            const result = await guild.delete(reason).catch((error) => {
                err(error)
            })
            if (!result) return
            resolve(this)
        })
    }
    fetchByKV(filter: Object): Promise<Array<Guild>> {
        return new Promise(async (resolve) => {
            const guildData = await GuildModel.find(filter).populate('blackLotus.constelation')
            if (!guildData || guildData.length === 0) return []
            const guilds = []
            for (const guild of guildData) {
                const guildObj = await this.client.guilds.fetch(guild.id).catch(() => {})
                if (!guildObj) {
                    this.client.logger.warn(`Guild ${guild.id} was not found when trying to fetch it`)
                    continue
                }
                guilds.push(new Guild(guild.id, this.client, guildObj, guild as any))
            }
            resolve(guilds)
        })
    }
}