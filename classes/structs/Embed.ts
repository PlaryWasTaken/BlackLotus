import MessageModel from "../../models/nEmbedMessageModel";
import ConstellationModel from "../../models/constelationModel";
import {APIEmbed, APIEmbedField, EmbedBuilder, TextChannel} from "discord.js";
import {ExtendedClient} from "../../types";
import Guild from "./Guild";
export default class Embed {
    private client: ExtendedClient;
    private readonly id: number;
    private message: any;
    private servers: Guild[];
    constructor(client: ExtendedClient, id: number) {
        this.client = client
        this.id = id
    }
    loadInfo(): Promise<this> {
        return new Promise(async (resolve) => {
            this.message = await MessageModel.findOne({ identifier: this.id })
            this.servers = await this.client.guildManager.fetchByKV({ "blackLotus.constelation": { $exists: true }, "blackLotus.embedWorthy": true})
            resolve(this)
        })
    }
    getServerClasses(): Promise<Map<string, Guild[]>> {
        return new Promise(async (resolve) => {
            let classMap = new Map<string, Guild[]>()
            for (let server of this.servers) {
                let serverClass = classMap.get(server.data.blackLotus.constelation._id + '')
                if (!serverClass) {
                    classMap.set(server.data.blackLotus.constelation._id + '', new Array(server))
                } else {
                    serverClass.push(server)
                }
            }

            resolve(classMap)
        })
    }
    private makeFields(): Promise<APIEmbedField[]> {
        return new Promise(async (resolve) => {
            let fields = []
            let serverClasses = await this.getServerClasses()
            const constellations = await ConstellationModel.find()
            constellations.sort((a, b) => a.position - b.position)
            for (const constellation of constellations) {
                let constellationClasses = serverClasses.get(constellation._id + '')
                if (!constellationClasses) continue
                let chunked: Guild[][] = []
                const size = 10;
                for (let i = 0; i < constellationClasses.length; i += size) {
                    chunked.push(constellationClasses.slice(i, i + size))
                }
                chunked.sort((a, b) => a.length - b.length)
                let i = chunked.length
                for (const chunk of chunked) {
                    let name = constellation.name + ` ${i}`
                    if (i === 1) name = constellation.name
                    i--
                    fields.push({
                        name: `${this.message.fieldNamePrefix} ${name}`,
                        value: chunk.map(v => {
                            return `[${v.displayedName}](${v.data.blackLotus.invite})`
                        }).join('\n'),
                        inline: true
                    })
                }
            }
            resolve(fields)
        })
    }
    getEmbedJson(): Promise<APIEmbed> {
        return new Promise(async (resolve) => {
            const fields = await this.makeFields()
            const embed = new EmbedBuilder().setTitle(this.message.title).setDescription(this.message.description).setColor(this.message.color).setFields(fields).setFooter({ text: this.message.footer }).setImage(this.message.image)
            resolve(embed.toJSON())
        })
    }
    updateEmbed(): Promise<this> {
        return new Promise(async (resolve, err) => {
            await this.loadInfo() // Reload embed info

            const channel = await this.client.channels.fetch(this.message.channelId).catch(err) as TextChannel
            if (!channel) return
            const message = await channel.messages.fetch(this.message.msgId).catch(err)
            if (!message) return
            const embed = new EmbedBuilder(await this.getEmbedJson())
            const result = await message.edit({embeds: [embed]}).catch(err)
            if (!result) return
            resolve(this)
        })
    }
}