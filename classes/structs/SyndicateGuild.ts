import ConstellationHandler from './Constellation';
import Partnerships from "./Partnership";
import serverModel, {GuildDocument} from "#models/guild.js";
import {ExtendedClient} from "#/types";
import {Guild as DGuild } from "discord.js";

export default class SyndicateGuild {
    public readonly id: string;
    private readonly client: ExtendedClient;
    public readonly guild: DGuild;
    public data: GuildDocument;
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

        this.staffs = this.data.modules.syndicate.staffs || []
        this.roles.push(this.data.modules.syndicate.role)
        this.serverRoleId = this.data.modules.syndicate.role
    }
    get name() {
        return this.guild.name
    }
    get displayedName() {
        return this.data.modules.syndicate.displayName
    }
    get representant() {
        return this.data.modules.syndicate.representant
    }

    updateName(name: string): Promise<this> {
        return new Promise(async (resolve, err) => {
            this.data.modules.syndicate.displayName = name
            this.data.modules.syndicate.embedWorthy = name.length <= 25
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

            await this.guild.invites.delete(this.data.modules.syndicate.invite).catch(() => {}) // Clean up the invite the bot created
            this.client.emit('syndicate.guildDeleteComplete', this, reason)
            this.client.emit('syndicate.guildDelete', this, reason)
            this.data.delete()
            resolve(this)
        })
    }
}