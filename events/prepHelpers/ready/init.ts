import Event from "#structs/Event";
import statusHandler from '#structs/Status';
import {ExtendedClient} from "#/types";
import {Logger} from "winston";
import {TextChannel} from "discord.js";
import {sleep} from "#/utils/sleep";


async function startTicks(client: ExtendedClient, logger: Logger) {
    logger = logger.child({service: 'Tick', hexColor: '#d1ff75'})
    while (true) {
        logger.debug('Tick de 1 minuto')
        client.emit("tick")
        await sleep(60 * 1000) // 60 seconds
    }
}



export default new Event().setData("ready", async (client) => {
    const logger = client.logger.child({service: 'Init', hexColor: '#75ffb1'})
    logger.info('Registering global slash commands')
    client.application.commands.set(client.slashCommands.filter(c => c.isGlobal).map(c => c.command.toJSON())).then(() => {
        logger.info('Global slash commands registered')
    }).catch(e => console.log(e))
    logger.info('Registering guild slash commands')
    const guilds = client.slashCommands.filter(c => !c.isGlobal)
    for (let [_, command] of guilds) {
        // await command.registerCommandForGuilds(client)
    }
    logger.info('Guild slash commands registered')

    // noinspection ES6MissingAwait
    startTicks(client, client.logger)

    logger.info('Starting status handler')
    client.statusHandler = new statusHandler(client);
    // noinspection ES6MissingAwait
    client.statusHandler.startLoop()
    logger.info('Status handler started')

    logger.info('Fetching Black Lotus guild and logging channel')
    client.blackLotus = await client.guilds.fetch(process.env.MAIN_GUILD)
    logger.info('Fetched Black Lotus guild')
    const logChannel = await client.blackLotus.channels.fetch(process.env.LOG_CHANNEL).catch(() => {}) as TextChannel | undefined
    if (!logChannel) {
        logger.error('Can\'t find log channel in black lotus guild!')
        throw new Error('Can\'t find log channel in black lotus guild!')
    }
    client.logChannel = logChannel
    logger.info('Fetched logging channel')

    logger.notice('Update outdated guild names')
    const servers = await client.blackLotusManager.fetchByKV({ "modules.blackLotus.trackNameChanges": true }).catch(() => {})
    if (!servers) return;
    for (let server of servers) {
        if (server.name !== server.displayedName) {
            await server.updateName(server.name)
        }
    }
    logger.notice('Ready event finished successfully')
}, true)