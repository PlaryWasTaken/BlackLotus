import {ExtendedClient} from "../../types";
import {Logger} from "winston";

type UpdateFn = (client: ExtendedClient) => Promise<void>
// noinspection JSUnusedGlobalSymbols
export class UpdateManager {
    private readonly client: ExtendedClient;
    private logger: Logger;
    private readonly updateTargets: Map<string, UpdateFn> = new Map()
    constructor(client: ExtendedClient, logger: Logger) {
        this.client = client
        this.logger = logger
    }
    public registerNewUpdateTarget(id: string, updateFn: UpdateFn) {
        this.updateTargets.set(id, updateFn)
    }
    public async runUpdateForTarget(id: string) {
        const updateFn = this.updateTargets.get(id)
        if (!updateFn) return false
        return await updateFn(this.client).then(() => true).catch(() => false)
    }
    public async runAllUpdates() {
        for (let [_, updateFn] of this.updateTargets) {
            await updateFn(this.client).catch(() => {})
        }
    }
}