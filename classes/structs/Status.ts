import {ExtendedClient} from "../../types";
import discord, {ActivityType} from 'discord.js';
import {sleep} from "../../utils/sleep";
// noinspection JSUnusedGlobalSymbols
export default class statusHandler {
    private client: ExtendedClient;
    private readonly statusList: [string, { type: ActivityType }][];
    private running: boolean = false;
    constructor(client: ExtendedClient) {

        this.client = client
        this.statusList = [
            [`${this.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} users!`, { type: discord.ActivityType.Watching }],
            [`Estou em ${this.client.guilds.cache.size} servidores!`, { type: discord.ActivityType.Playing}],
            ["https://theblacklotus.fr", { type: discord.ActivityType.Watching }],
            [`2° Aniversário da Black Lotus!`, { type: discord.ActivityType.Watching }],
        ]
    }

    async startLoop() {
        this.running = true
        while (this.running) {
            for (let status of this.statusList) {
                this.client.user.setActivity(status[0], status[1])
                await sleep(20000)
            }
        }
    }
    stopLoop() {
        this.running = false
    }
    setCustomStatus(options: { type: ActivityType; name: string }) {
        this.client.user.setActivity(options)
    }
}