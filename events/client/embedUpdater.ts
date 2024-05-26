import Event from "#structs/Event";

let lastUpdate = 0
export default new Event().setData("tick", async (client) => {
    if (lastUpdate % 30 === 0) {
        const logger = client.logger.child({service: 'Embed Updater', hexColor: '#75baff'})
        logger.info('Sending Update Trigger to Update Manager')
        await client.updateManager.runAllUpdates().catch(() => {
            logger.error('Error while running updates')
        })
    }
    lastUpdate++
}, true)