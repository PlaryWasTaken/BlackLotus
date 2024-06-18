import { ExtendedClient } from "../../types";
import { ActivityType } from 'discord.js';
import { sleep } from "../../utils/sleep";
import serverSchema from '#models/guild.js';

type StatusFunction = (client: ExtendedClient) => Promise<[string, { type: ActivityType }]>;

export default class StatusHandler {
    private client: ExtendedClient;
    private readonly statusTemplates: StatusFunction[];
    private running: boolean = false;

    constructor(client: ExtendedClient) {
        this.client = client;
        this.statusTemplates = [
            async (client) => 
                [`🪄 Alcançando ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} usuários!`, {
                 type: ActivityType.Custom }],
            async (client) => 
                [`🔭 Presente em ${client.guilds.cache.size} servidores.`, 
                { type: ActivityType.Custom }],
            async () => 
                [`📌 blacklotusassoc.org`, 
                { type: ActivityType.Custom }],
            async () => {
                const countServersMembers = await serverSchema.countDocuments();
                return [`✨ ${countServersMembers} servidores membros`, 
                { type: ActivityType.Custom}];
            }
        ];
    }

    async startLoop() {
        this.running = true;
        while (this.running) {
            for (let status of this.statusTemplates) {
                const [activity, options] = await status(this.client);
                this.client.user.setActivity(activity, options);
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
