
// noinspection InfiniteLoopJS
import Event from "../../classes/structs/Event";
import statusHandler from '../../classes/structs/Status';
import {ExtendedClient} from "../../types";
import {clear, Logger} from "winston";
import {TextChannel} from "discord.js";
import {sleep} from "../../utils/sleep";

const Second = 1000 as const
async function startTicks(client: ExtendedClient, logger: Logger) {
    logger = logger.child({service: 'Tick', hexColor: '#d1ff75'})
    while (true) {
        logger.debug('Tick de 1 minuto')
        client.emit("tick")
        await sleep(60 * Second)
    }
}
async function startEmbedTicks(client: ExtendedClient, logger: Logger) {
    logger = logger.child({service: 'Embed Tick', hexColor: '#75ffa0'})
    while (true) {
        logger.info('Tick de 30 minutos')
        await client.updateManager.runAllUpdates()
        client.emit("blacklotus.30minTick")
        await sleep(1800000)
    }
}


// noinspection JSUnusedGlobalSymbols
export default new Event().setData("ready", async (client) => {
    const logger = client.logger.child({service: 'Ready event', hexColor: '#ff75e6'})
    logger.notice('Client ready!')
    client.application.commands.set(client.slashCommands.filter(c => c.isGlobal).map(c => c.command.toJSON())).then(() => {
        logger.info('Global slash commands registered')
    }).catch(e => console.log(e))
    // noinspection ES6MissingAwait
    startTicks(client, client.logger)
    // noinspection ES6MissingAwait
    startEmbedTicks(client, client.logger)
    client.statusHandler = new statusHandler(client);
    // noinspection ES6MissingAwait
    client.statusHandler.startLoop()
    client.blackLotus = await client.guilds.fetch('896047806454837278')
    const logChannel = await client.blackLotus.channels.fetch(client.configs.logChannel).catch(() => {}) as TextChannel | undefined
    if (!logChannel) return logger.error('Can\'t find log channel in black lotus guild!')
    client.logChannel = logChannel
    const servers = await client.guildManager.fetchByKV({ "blackLotus.trackNameChanges": true }).catch(() => {})
    if (!servers) return;
    for (let server of servers) {
        if (server.name !== server.displayedName) {
            logger.info(`Atualizando nome da guilda ${server.displayedName} para ${server.name} (ID: ${server.id})`)
            await server.updateName(server.name)
        }
    }
    logger.notice('Ready event finished successfully')
}, true)