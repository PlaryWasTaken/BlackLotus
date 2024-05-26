import ConstellationHandler from './Constellation';
import Partnerships from "./Partnership";
import serverModel, {GuildDocument} from "#models/guild.js";
import {ExtendedClient} from "#/types";
import {Guild as DGuild } from "discord.js";
async function removeRoleFromStaffs(Class: BlackLotusGuild, client: ExtendedClient) {
    for (const staff of Class.staffs) {
        const member = await client.blackLotus.members.fetch(staff.id).catch(() => {})
        if (!member) continue
        Class.roles.push(staff.role)
        let otherServers = await serverModel.find({"blackLotus.staffs": {$elemMatch: {id: staff.id}}})
        otherServers = otherServers.filter(server => server.id !== Class.id)
        if (otherServers.length === 0) continue
        const rolesToAdd = new Set<string>()
        for (const server of otherServers) {
            const guildData = await client.blackLotusManager.fetch(server.id).catch(() => {})
            if (!guildData) continue
            const staff2 = guildData.staffs.find(staff2 => staff2.id === staff.id) // Find the staff in the other server to access his roles
            if (!staff2.role) {
                // Remove the staff from the database since he doesnt have a role
                const index = guildData.staffs.findIndex(staff2 => staff2.id === staff.id)
                guildData.data.modules.blackLotus.staffs.splice(index, 1)
                await guildData.data.save()
            }
            rolesToAdd.add(staff2.role)
        }
        await member.roles.add([...rolesToAdd])
    }
}
export default class BlackLotusGuild {
    public readonly id: string;
    private client: ExtendedClient;
    public readonly guild: DGuild;
    public data: GuildDocument;
    public readonly constelation: ConstellationHandler;
    public readonly partnerships: Partnerships;
    public staffs: Array<{
        id: string,
        role: string
    }>
    public roles: Array<string> = []
    public serverRoleId: string;
    constructor(id: string, client: ExtendedClient, guild: DGuild, data: GuildDocument) {
        this.id = id
        this.client = client
        this.guild = guild
        this.data = data
        if (this.guild) {
            this.constelation = new ConstellationHandler(id, client, this.guild, data)
            this.partnerships = new Partnerships(client, this.guild, data)
        } else client.logger.warning('No guild data provided for guild ' + data.modules.blackLotus.displayName + ' (' + id + ')' )
        this.staffs = this.data.modules.blackLotus.staffs || []
        this.roles.push(this.data.modules.blackLotus.role, this.data.modules.blackLotus.constelation.roleId)
        this.serverRoleId = this.data.modules.blackLotus.role

    }
    get name() {
        return this.guild.name
    }
    get displayedName() {
        return this.data.modules.blackLotus.displayName
    }
    get representant() {
        return this.data.modules.blackLotus.representant
    }

    updateName(name: string): Promise<this> {
        return new Promise(async (resolve, err) => {
            this.data.modules.blackLotus.displayName = name
            this.data.modules.blackLotus.embedWorthy = name.length <= 25
            const result = await this.data.save().catch(err)
            if (!result) return
            resolve(this)
        })
    }

    removeStaff(id: string): Promise<this> {
        return new Promise(async (resolve, err) => {
            const index = this.staffs.findIndex(staff => staff.id === id)
            if (index === -1) return err('Staff not found')
            this.staffs.splice(index, 1)
            await this.data.save()
            resolve(this)
        })
    }

    // noinspection JSIgnoredPromiseFromCall
    setBlacklisted(blacklisted: boolean): Promise<this> {
        return new Promise(async (resolve, err) => {
            this.data.blacklisted = blacklisted
            const result = await this.data.save().catch(() => {})
            if (!result) return err('Failed to save')
            resolve(this)
        })
    }

    delete(reason: string = 'Guilda foi deletada e tinha o bot no servidor (Razão padrão)'): Promise<this> {
        return new Promise(async (resolve, err) => {
            if (this.data.blacklisted) return err('Guild is blacklisted and cannot be deleted')
            this.staffs.push({
                id: this.data.modules.blackLotus.representant,
                role: "897108319175581746" // id of the representant role
            })
            await removeRoleFromStaffs(this, this.client)

            await this.guild.invites.delete(this.data.modules.blackLotus.invite).catch(() => {}) // Clean up the invite the bot created
            this.client.emit('blacklotus.guildDeleteComplete', this, reason)
            this.client.emit('blacklotus.guildDelete', this, reason)
            this.data.delete()
            this.client.blackLotus.roles.delete(this.data.modules.blackLotus.role)
            resolve(this)
        })
    }
}