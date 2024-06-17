import MessageModel, { EmbedMessageModel } from "#models/nEmbedMessageModel";
import ConstellationModel from "#models/constellation";
import { APIEmbed, APIEmbedField, EmbedBuilder, TextChannel } from "discord.js";
import { ExtendedClient } from "#/types";
import BlackLotusGuild from "./BlackLotusGuild";
import SyndicateGuild from "#structs/SyndicateGuild";
export default class SyndicateEmbed {
  private client: ExtendedClient;
  private readonly id: number = 1;
  public message: EmbedMessageModel;
  private servers: SyndicateGuild[];
  constructor(client: ExtendedClient) {
    this.client = client;
  }
  loadInfo(): Promise<this> {
    return new Promise(async (resolve) => {
      this.message = await MessageModel.findOne({ identifier: this.id });
      this.servers = await this.client.syndicateManager.fetchByKV({
        "modules.syndicate.embedWorthy": true,
      });
      resolve(this);
    });
  }
  private makeFields(): Promise<APIEmbedField[]> {
    return new Promise(async (resolve) => {
      let fields = [];
      let chunked: SyndicateGuild[][] = [];
      const size = 10;
      for (let i = 0; i < this.servers.length; i += size) {
        chunked.push(this.servers.slice(i, i + size));
      }
      chunked.sort((a, b) => a.length - b.length);
      let i = chunked.length;
      for (const chunk of chunked) {
        i--;
        fields.push({
          name: `\u200B`,
          value: chunk
            .map((v) => {
              return `[${v.displayedName}](${v.data.modules.syndicate.invite})`;
            })
            .join("\n"),
          inline: true,
        });
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
        .setFooter({ text: this.message.footer });
      if (this.message.image) embed.setImage(this.message.image);
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
