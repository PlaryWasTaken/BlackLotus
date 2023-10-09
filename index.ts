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
import winston from "winston";
import {Client, Collection} from "discord.js";
const client = new Client({intents: 1279});
require('dotenv').config();
import mongoose from 'mongoose';
import {ExtendedClient} from "./types";

import guildManager from './classes/managers/GuildManager';
import Embed from './classes/structs/Embed';
const configs = require('./config.json');

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
extendedClient.guildManager = new guildManager(extendedClient);
extendedClient.commands = new Collection();
extendedClient.events = new Collection();
extendedClient.slashCommands = new Collection();
extendedClient.mainEmbed = new Embed(extendedClient, 0);
extendedClient.configs = configs;
extendedClient.logger = mainLogger;

['eventHandler', 'interactionHandler'].forEach(handler => {
    import(`./handlers/${handler}`).then((file) => {
        file.default(client, mainLogger.child({service: handler, hexColor: '#CCAAFF'}))
    })
})

mongoose.set('strictQuery', false);
mongoose.connect(process.env.MONGODB_SRV).then(() => {
    const dbLogger = mainLogger.child({service: 'Database', hexColor: '#6affff'});
    dbLogger.notice("Database was succesfully connected")
    extendedClient.mainEmbed.loadInfo().then(() => {
        mainLogger.info('Loaded main embed handler')
    })
}).catch(err => {
    console.error(err);
});


import express from "express";
import {exec} from "child_process"
import pm2 from "pm2"
import chalk from "chalk";
const app = express();
const port = process.env.PORT
const apiLogger = mainLogger.child({service: 'API', hexColor: '#c8ffdc'});

app.use('/api', (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        if (token === process.env.API_TOKEN) {
            next();
        } else {
            res.status(401).send('Invalid Bearer token');
        }
    } else {
        res.status(401).send('Bearer token missing');
    }
});
app.post(`/${process.env.UPDATEPATH}`, async (req, res) => {
    apiLogger.notice("An event has been detected on the listened port: starting execution...")
    console.log(req)
    async function sh(cmd: string): Promise<{ stdout: string, stderr: string }> {
        return new Promise(function (resolve, reject) {
            exec(cmd, (err, stdout, stderr) => {
                if (err) {
                    reject(err);
                } else {
                    resolve({stdout, stderr});
                }
            });
        });
    }

    let {stdout} = await sh(`cd /home/ubuntu/BlackLotus && git pull`)
    console.log(stdout)
    apiLogger.notice(`Dados puxados do github, reiniciando...`)
    res.sendStatus(200)
    pm2.reload(`BlackLotus`, (err) => {
        console.log(err)
    });
})
app.get(`/api/constellations`, async (req, res) => {
    const guildModel = require('./models/guildDataModel')
    const servers = await guildModel.find({"blackLotus.constelation": {$exists: true}}).populate("blackLotus.constelation")
    const constellations = new Collection<string, any[]>()
    servers.forEach(server => {
        if (constellations.get(server.blackLotus.constelation.name)) {
            constellations.get(server.blackLotus.constelation.name).push(server)
        } else {
            constellations.set(server.blackLotus.constelation.name, [server])
        }
    })
    let obj = {}
    let namee: any;
    let serverss: any;
    for ([namee, serverss] of constellations) {
        obj[namee] = serverss.map(server => {
            const guild = client.guilds.cache.get(server.id)
            if (!guild) return {
                cached: false,
                id: server.id,
                displayName: server.blackLotus.displayName,
                constelation: {
                    name: server.blackLotus.constelation.name,
                    minMembers: server.blackLotus.constelation.minimumMemberAmmout,
                },
                partnerships: server.partnerships,
                invite: server.blackLotus.invite
            }
            return {
                cached: true,
                currentName: guild.name,
                id: guild.id,
                displayName: server.blackLotus.displayName,
                constelation: {
                    name: server.blackLotus.constelation.name,
                    minMembers: server.blackLotus.constelation.minimumMemberAmmout,
                },
                members: guild.memberCount,
                partnerships: server.partnerships,
                invite: server.blackLotus.invite,
                icon: guild.iconURL({ size: 1024 })
            }
        })
    }
    res.status(200).json(obj)
})
app.listen(port, () => {
    apiLogger.notice(`Listening on port ${port}`)
})