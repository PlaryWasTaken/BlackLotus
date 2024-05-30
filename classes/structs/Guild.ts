import ConstellationHandler from './Constellation';
import Partnerships from "./Partnership";
import serverModel, {GuildDocument} from "#models/guild.js";
import {ExtendedClient} from "#/types";
import {Guild as DGuild } from "discord.js";

export default class Guild {
    public readonly id: string;
    private client: ExtendedClient;
    public readonly guild: DGuild;
    public data: GuildDocument;
    public modules: GuildDocument['modules'];
    constructor(id: string, client: ExtendedClient, guild: DGuild, data: GuildDocument) {
        this.id = id
        this.client = client
        this.guild = guild
        this.data = data
        this.modules = data.modules

    }

    delete(): Promise<this> {
        return new Promise(async (resolve, err) => {
            if (this.data.blacklisted) return err('Guild is blacklisted and cannot be deleted')
            resolve(this)
        })
    }
}