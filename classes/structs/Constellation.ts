import ConstellationModel from '#models/constelation'
import GuildModel, {GuildDocument} from '#models/guild.js'
import {ExtendedClient} from "#/types";
import {Guild} from "discord.js";
type Constelation = {_id: string, name: string, defaultRoles: any[], position: number, minimumMemberAmount: number, roleId: string}
export default class ConstellationHandler {
    private id: any;
    private client: ExtendedClient;
    private guild: Guild;
    private data: GuildDocument;
    constructor(id: any, client: ExtendedClient, guild: Guild, data: any) {
        this.id = id
        this.client = client
        this.guild = guild || client.guilds.cache.get(id)
        this.data = data
    }
    fetch(): Promise<Constelation> {
        return new Promise(async (resolve, err) => {
            const memberAmount = await this.guild.members.fetch().then(collection => { return collection.size }).catch(() => { })
            if (!memberAmount) return err('No member amount')
            const constellations = await ConstellationModel.find()
            constellations.sort((a, b) => b.position - a.position)
            let correctConstellation: unknown;
            for (let i = 0; i < constellations.length; i++) {
                if (memberAmount < constellations[i].minimumMemberAmmout) {
                    if (i === 0) correctConstellation = constellations[i]
                    else correctConstellation = constellations[i - 1]
                    break
                } else if (i === constellations.length - 1) {
                    correctConstellation = constellations[i]
                    break
                }
            }
            resolve(correctConstellation as {
                _id: string;
                name: string;
                defaultRoles: Array<any>;
                position: number;
                minimumMemberAmount: number;
                roleId: string;
            })
        })
    }
    updateConstellation(): Promise<Constelation> {
        return new Promise(async (resolve, err) => {
            this.client.logger.info(`Updating Constellation for ${this.data.modules.blackLotus.displayName}`)
            const constellation = await this.fetch()
            if (!this.data.modules.blackLotus.role) return err('No role')
            const role = await this.client.blackLotus.roles.fetch(this.data.modules.blackLotus.role).catch(() => {})
            const constelationRole = await this.client.blackLotus.roles.fetch(constellation.roleId).catch(() => {})
            const representant = await this.client.blackLotus.members.fetch(this.data.modules.blackLotus.representant).catch(() => {})
            if (!role || !constelationRole || !representant) return err('no role found')
            await role.edit({ position: constelationRole.position - 1 }) // Move the guild role to bellow the constellation role
            if (!this.data.modules.blackLotus.staffs) this.data.modules.blackLotus.staffs = []
            this.data.modules.blackLotus.staffs.push(this.data.modules.blackLotus.representant) // Everything applies the same to the representant so just add him in here instead of doing something else
            for (const staff of this.data.modules.blackLotus.staffs) {
                if (!staff.id) continue
                const member = await this.client.blackLotus.members.fetch(staff.id).catch(() => {})
                if (!member) { // Just in case the member left the server while the bot was offline
                    this.data.modules.blackLotus.staffs = this.data.modules.blackLotus.staffs.filter(staff2 => staff2.id !== staff.id)
                    this.data.markModified('modules.blackLotus.staffs')
                    await this.data.save()
                    continue
                }
                await member.roles.remove(this.data.modules.blackLotus.constelation.roleId)
                const staffGuilds = await this.client.blackLotusManager.fetchByKV({ "modules.blackLotus.staffs": { $elemMatch: { id: staff.id } } })
                const rolesToAdd = new Set() // Using a set to prevent duplicate ids
                rolesToAdd.add(constelationRole.id)
                for (const guild of staffGuilds) {
                    if (guild.id === this.data.id) continue
                    rolesToAdd.add(guild.data.modules.blackLotus.constelation.roleId ) // This has to stay here to maintain the old constelation role if the user is part of the staff of another guild
                    if (guild.data.modules.blackLotus.role) {
                        rolesToAdd.add(guild.data.modules.blackLotus.role)
                    }
                }
                // Adding all the roles at once, from the other guilds in wich the user is part of the staff team
                await member.roles.add([...rolesToAdd] as any)
            }
            // Remove the representant from the staff array
            this.data.modules.blackLotus.staffs = this.data.modules.blackLotus.staffs.filter(staff => staff.id !== this.data.modules.blackLotus.representant)
            await GuildModel.findOneAndUpdate({ id: this.data.id }, { $set: { "modules.blackLotus.constelation": constellation._id } })
            resolve(constellation)
        })
    }
}