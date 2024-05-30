/*
    Old:
    - mainInviteDelete: Emitted when the main invite is deleted (Returns: D_Invite)
    - serverLeft: Emitted when the server leaves or gets removed from the database (Returns: Guild)
    - serverCreated: Emitted when the server joins or gets added to the database (Returns: Guild)

    New:
    D_ - Prefix means that the type is a discord.js type
    Custom Events:
    - blackLotus.guildDeleteComplete: Emitted when the server is deleted from the database (Returns: Guild, Reason)
    - blackLotus.guildDeleteIncomplete: Emitted when the server is deleted from the database (Returns: Id, Reason)
    - blacklotus.guildDelete: Emitted when the server is deleted from the database (Returns: Guild | Id, Reason)
    - blacklotus.newGuild: Emitted when the server is added to the database (Returns: Guild)
    - blacklotus.serverAccept: Emitted when the server is accepted (Returns: Id)
    - blacklotus.serverReject: Emitted when the server is rejected (Returns: Empty)
    - blackLotus.representantLeft: Emitted when the representant leaves the server (Returns: D_GuildMember | D_PartialGuildMember)
    - blackLotus.guildRepresentantLeft: Emitted for every server the user that left was a representant of (Returns: D_GuildMember | D_PartialGuildMember, Guild)
    - blacklotus.30minTick: Emitted every 30 minutes (Returns: Empty)
    - blacklotus.mainInviteDelete: Emitted when the black lotus invite is deleted in a guild (Returns: D_Invite)
 */


require('module-alias/register')
import SyndicateEmbed from "#structs/SyndicateEmbed";
import winston from "winston";
import {Client, Collection} from "discord.js";
import mongoose from 'mongoose';
import {ExtendedClient} from "./types";
import SyndicateManager from "#managers/SyndicateManager";
import BlackLotusManager from '#managers/BlackLotusManager';
import BlackLotusEmbed from '#structs/BlackLotusEmbed';
import GuildManager from "#managers/GuildManager";
import {UpdateManager} from "#managers/UpdateManager";
import chalk from "chalk";
import {initWebApi} from "./web";

const client = new Client({intents: 1279});
require('dotenv').config();


function createLogger(service: string, hexColor: string): winston.Logger {
    return winston.createLogger({
        levels: winston.config.syslog.levels,
        level: process.env.LOGLEVEL || 'info',
        transports: [
            new winston.transports.File({
                filename: '../logs/error-complete.log',
                level: 'error',
                format: winston.format.combine(
                    winston.format.json(),
                    winston.format.timestamp(),
                    winston.format.splat()
                )
            }),
            new winston.transports.File({
                filename: '../logs/complete.log',
                format: winston.format.combine(
                    winston.format.json(),
                    winston.format.timestamp(),
                    winston.format.splat()
                )
            }),
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    winston.format.printf(info => `${info.fallback?chalk.red("FALLBACK") + " ":""}${chalk.hex(info.hexColor)(`(${info.service})`)} [${info.level}] ${info.message}`),
                    winston.format.splat()
                )
            })
        ]
    }).child({service: service, hexColor: hexColor});
}
const mainLogger = createLogger('App', '#aa00ff');



// noinspection JSIgnoredPromiseFromCall
client.login(process.env.DISCORD_TOKEN)
const extendedClient = client as ExtendedClient
extendedClient.logger = mainLogger;
extendedClient.blackLotusManager = new BlackLotusManager(extendedClient);
extendedClient.syndicateManager = new SyndicateManager(extendedClient);
extendedClient.guildManager = new GuildManager(extendedClient);
extendedClient.commands = new Collection();
extendedClient.events = new Collection();
extendedClient.slashCommands = new Collection();
extendedClient.mainEmbed = new BlackLotusEmbed(extendedClient, 0);
extendedClient.updateManager = new UpdateManager(extendedClient, mainLogger.child({service: 'UpdateManager', hexColor: '#ffaa00'}));

const syndicateEmbed = new SyndicateEmbed(extendedClient);
extendedClient.updateManager.registerNewUpdateTarget('blackLotus', extendedClient.mainEmbed.updateEmbed.bind(extendedClient.mainEmbed));
extendedClient.updateManager.registerNewUpdateTarget('syndicate', syndicateEmbed.updateEmbed.bind(syndicateEmbed));

['eventHandler', 'interactionHandler'].forEach(handler => {
    import(`./handlers/${handler}`).then((file) => {
        file.default(client, mainLogger.child({service: handler, hexColor: '#CCAAFF'}))
    })
})

mongoose.set('strictQuery', false).connect(process.env.MONGODB_SRV).then(() => {
    const dbLogger = mainLogger.child({service: 'Database', hexColor: '#6affff'});
    dbLogger.notice("Database was succesfully connected")
    extendedClient.mainEmbed.loadInfo().then(() => {
        mainLogger.info('Loaded main embed handler')
    })
    initWebApi(mainLogger, extendedClient)
}).catch(err => {
    console.error(err);
});