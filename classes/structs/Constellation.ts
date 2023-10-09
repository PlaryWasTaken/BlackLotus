import ConstellationModel from '../../models/constelationModel'
import GuildModel from '../../models/guildDataModel'
import {ExtendedClient} from "../../types";
import {Guild} from "discord.js";
type Constelation = {_id: string, name: string, defaultRoles: any[], position: number, minimumMemberAmount: number, roleId: string}
export default class ConstellationHandler {
    private id: any;
    private client: ExtendedClient;
    private guild: Guild;
    private data: any;
    constructor(id: any, client: ExtendedClient, guild: Guild, data: any) {
        this.id = id
        this.client = client
        this.guild = guild || client.guilds.cache.get(id)
        this.data = data
    }
    fetch(): Promise<Constelation> {
        return new Promise(async (resolve) => {
            const memberAmount = await this.guild.members.fetch().then(collection => { return collection.size })
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
            this.client.logger.info(`Updating Constellation for ${this.data.blackLotus.displayName}`)
            const constellation = await this.fetch()
            if (!this.data.blackLotus.role) return err('No role')
            const role = await this.client.blackLotus.roles.fetch(this.data.blackLotus.role).catch(() => {})
            const constelationRole = await this.client.blackLotus.roles.fetch(constellation.roleId).catch(() => {})
            const representant = await this.client.blackLotus.members.fetch(this.data.representant).catch(() => {})
            if (!role || !constelationRole || !representant) return err('no role found')
            await role.edit({ position: constelationRole.position - 1 }) // Move the guild role to bellow the constellation role
            if (!this.data.blackLotus.staffs) this.data.blackLotus.staffs = []
            this.data.blackLotus.staffs.push(this.data.blackLotus.representant) // Everything applies the same to the representant so just add him in here instead of doing something else
            for (const staff of this.data.blackLotus.staffs) {
                if (!staff.id) continue
                const member = await this.client.blackLotus.members.fetch(staff.id).catch(() => {})
                if (!member) { // Just in case the member left the server while the bot was offline
                    this.data.blackLotus.staffs = this.data.blackLotus.staffs.filter(staff2 => staff2.id !== staff.id)
                    await this.data.save()
                    continue
                }
                await member.roles.remove(this.data.blackLotus.constellation.roleId)
                const staffGuilds = await this.client.guildManager.fetchByKV({ "blackLotus.staffs": { $elemMatch: { id: staff.id } } })
                const rolesToAdd = new Set() // Using a set to prevent duplicate ids
                rolesToAdd.add(constelationRole.id)
                for (const guild of staffGuilds) {
                    if (guild.id === this.data.id) continue
                    rolesToAdd.add(guild.data.blackLotus.constelation.roleId ) // This has to stay here to maintain the old constelation role if the user is part of the staff of another guild
                    if (guild.data.blackLotus.role) {
                        rolesToAdd.add(guild.data.blackLotus.role)
                    }
                }
                // Adding all the roles at once, from the other guilds in wich the user is part of the staff team
                await member.roles.add([...rolesToAdd] as any)
            }
            // Remove the representant from the staff array
            this.data.blackLotus.staffs = this.data.blackLotus.staffs.filter(staff => staff.id !== this.data.blackLotus.representant.id)
            await GuildModel.findOneAndUpdate({ id: this.data.id }, { $set: { "blackLotus.constelation": constellation._id } })
            resolve(constellation)
        })
    }
}