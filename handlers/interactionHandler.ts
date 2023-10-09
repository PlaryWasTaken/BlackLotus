import {readdirSync, statSync} from 'fs';
import {ExtendedClient} from "../types";
import {extname, resolve} from "path";
import Command from "../classes/structs/Command";
import {Logger} from "winston";

export default (client: ExtendedClient, logger: Logger) => {
    findJsFiles("./slash_commands", client, logger)
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
                const command: Command = file.default
                logger.info(`Loading slash command ${command.name} from ${filePath}`)
                client.slashCommands.set(command.name, command)
            }).catch((err) => {
                logger.error(`Error loading slash command ${filePath}\n${err}`)
            })
        }
    }
}