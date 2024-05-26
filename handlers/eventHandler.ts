import {readdirSync, statSync} from 'fs';
import {resolve, extname} from 'path';
import {ExtendedClient} from "#/types";
import {Logger} from "winston";

export default (client: ExtendedClient, logger: Logger) => {
    findJsFiles("./events", client, logger)
}

function findJsFiles(dir: string, client: ExtendedClient, logger: Logger) {
    const list = readdirSync(dir);
    logger.debug(`${list.length} files found in ${dir}`)
    for (const file of list) {
        const filePath = resolve(dir, file);
        const stat = statSync(filePath);
        if (stat.isDirectory()) {
            logger.debug(`Found directory ${file} in ${dir} recursively calling findJsFiles`)
            findJsFiles(filePath, client, logger)
        } else if (extname(filePath) === '.js') {
            import(filePath).then((file) => {
                const event = file.default
                logger.info(`Loading event ${event.name} (Runs once: ${event.once}) from ${filePath}`)
                if (!event.once) client.on(event.name, event.run.bind(null, client))
                else client.once(event.name, event.run.bind(null, client))
            }).catch((err) => {
                logger.error(`Error loading event ${filePath}\n${err}`)
            })
        }
    }
}