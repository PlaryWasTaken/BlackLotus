import { ExtendedClient } from "../../types";
import discord, { ActivityType } from 'discord.js';
import { sleep } from "../../utils/sleep";
import serverSchema from '#models/guild.js';

export default class StatusHandler {
    private client: ExtendedClient;
    private readonly statusList: [string, { type: ActivityType }][];
    private running: boolean = false;

    constructor(client: ExtendedClient) {
        this.client = client;
        this.statusList = [
            [`🪄 Alcançando ${this.client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} usuários!`, { type: discord.ActivityType.Custom }],
            [`🔭 Presente em ${this.client.guilds.cache.size} servidores.`, { type: discord.ActivityType.Custom }],
            [`📌 blacklotusassoc.org`, { type: discord.ActivityType.Custom }],
        ];
    }

    async startLoop() {
        this.running = true;
        while (this.running) {
            for (let i = 0; i < this.statusList.length; i++) {
                if (i === this.statusList.length - 1) {
                    const countServersMembers = await serverSchema.countDocuments();
                    this.statusList[i] = [`✨ ${countServersMembers} servidores membros`, { type: discord.ActivityType.Custom }];
                }
                this.client.user.setActivity(this.statusList[i][0], this.statusList[i][1]);
                await sleep(20000);
            }
        }
    }

    stopLoop() {
        this.running = false;
    }

    setCustomStatus(options: { type: ActivityType; name: string }) {
        this.client.user.setActivity(options);
    }
}
