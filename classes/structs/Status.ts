import { ExtendedClient } from "../../types";
import { ActivityType } from 'discord.js';
import { sleep } from "../../utils/sleep";
import serverSchema from '#models/guild.js';

type StatusFunction = (client: ExtendedClient) => Promise<[string, ActivityType]>;

export default class StatusHandler {
    private client: ExtendedClient;
    private readonly statusTemplates: StatusFunction[];
    private running: boolean = false;

    constructor(client: ExtendedClient) {
        this.client = client;
        this.statusTemplates = [
            async (client) => [`🪄 Alcançando ${client.guilds.cache.reduce((a, g) => a + g.memberCount, 0)} usuários!`, ActivityType.Custom],
            async (client) => [`🔭 Presente em ${client.guilds.cache.size} servidores.`, ActivityType.Custom],
            async () => [`📌 blacklotusassoc.org`, ActivityType.Custom],
            async () => {
                const countServersMembers = await serverSchema.countDocuments();
                return [`✨ ${countServersMembers} servidores membros`, ActivityType.Custom];
            }
        ];
    }

    async startLoop() {
        this.running = true;
        while (this.running) {
            for (let getStatus of this.statusTemplates) {
                const [name, type] = await getStatus(this.client);
                this.client.user.setActivity(name, { type });
                await sleep(20000);
            }
        }
    }

    stopLoop() {
        this.running = false;
    }

    setCustomStatus(name: string, type: ActivityType) {
        this.client.user.setActivity(name, { type });
    }
}
