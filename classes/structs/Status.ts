import {ExtendedClient} from "../../types";

let running = true
function sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
}

import discord, {ActivityType} from 'discord.js';
export default class statusHandler {
    private client: ExtendedClient;
    private readonly statusList: [string, { type: ActivityType }][];
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
        running = true
        while (running) {
            for (let status of this.statusList) {
                // @ts-ignore
                if (running === false) break
                this.client.user.setActivity(status[0], status[1])
                await sleep(20000)
            }
        }
    }
    stopLoop() {
        running = false
    }
    setCustomStatus(options: { type: ActivityType; name: string }) {
        this.client.user.setActivity(options)
    }
}