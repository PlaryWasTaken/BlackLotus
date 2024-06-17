import MessageModel, { EmbedMessageModel } from "#models/nEmbedMessageModel";
import ConstellationModel from "#models/constellation";
import { APIEmbed, APIEmbedField, EmbedBuilder, TextChannel } from "discord.js";
import { ExtendedClient } from "#/types";
import BlackLotusGuild from "./BlackLotusGuild";
export default class BlackLotusEmbed {
  private client: ExtendedClient;
  private readonly id: number;
  public message: EmbedMessageModel;
  private servers: BlackLotusGuild[];
  constructor(client: ExtendedClient, id: number) {
    this.client = client;
    this.id = id;
  }
  loadInfo(): Promise<this> {
    return new Promise(async (resolve) => {
      this.message = await MessageModel.findOne({ identifier: this.id });
      this.servers = await this.client.blackLotusManager.fetchByKV({
        "modules.blackLotus.constellation": { $exists: true },
        "modules.blackLotus.embedWorthy": true,
      });
      resolve(this);
    });
  }
  getServerClasses(): Promise<Map<string, BlackLotusGuild[]>> {
    return new Promise(async (resolve) => {
      let classMap = new Map<string, BlackLotusGuild[]>();
      for (let server of this.servers) {
        let serverClass = classMap.get(
          server.data.modules.blackLotus.constellation._id + ""
        );
        if (!serverClass) {
          classMap.set(
            server.data.modules.blackLotus.constellation._id + "",
            new Array(server)
          );
        } else {
          serverClass.push(server);
        }
      }

      resolve(classMap);
    });
  }
  private makeFields(): Promise<APIEmbedField[]> {
    return new Promise(async (resolve) => {
      let fields = [];
      let serverClasses = await this.getServerClasses();
      const constellations = await ConstellationModel.find();
      constellations.sort((a, b) => a.position - b.position);
      for (const constellation of constellations) {
        let constellationClasses = serverClasses.get(constellation._id + "");
        if (!constellationClasses) continue;
        let chunked: BlackLotusGuild[][] = [];
        const size = 10;
        for (let i = 0; i < constellationClasses.length; i += size) {
          chunked.push(constellationClasses.slice(i, i + size));
        }
        chunked.sort((a, b) => a.length - b.length);
        let i = chunked.length;
        for (const chunk of chunked) {
          let name = constellation.name + ` ${i}`;
          if (i === 1) name = constellation.name;
          i--;
          fields.push({
            name: `${this.message.fieldNamePrefix} ${name}`,
            value: chunk
              .map((v) => {
                return `[${v.displayedName}](${v.data.modules.blackLotus.invite})`;
              })
              .join("\n"),
            inline: true,
          });
        }
      }
      resolve(fields);
    });
  }
  getEmbedJson(): Promise<APIEmbed> {
    return new Promise(async (resolve) => {
      const fields = await this.makeFields();
      const embed = new EmbedBuilder()
        .setTitle(this.message.title)
        .setDescription(this.message.description)
        .setColor(this.message.color as `#${string}`)
        .setFields(fields)
        .setFooter({ text: this.message.footer })
        .setImage(this.message.image);
      resolve(embed.toJSON());
    });
  }
  updateEmbed(): Promise<void> {
    return new Promise(async (resolve, err) => {
      await this.loadInfo(); // Reload embed info

      const channel = (await this.client.channels
        .fetch(this.message.channelId)
        .catch(err)) as TextChannel;
      if (!channel) return;
      const message = await channel.messages
        .fetch(this.message.msgId)
        .catch(err);
      if (!message) return;
      const embed = new EmbedBuilder(await this.getEmbedJson());
      const result = await message.edit({ embeds: [embed] }).catch(err);
      if (!result) return;
      resolve();
    });
  }
}
