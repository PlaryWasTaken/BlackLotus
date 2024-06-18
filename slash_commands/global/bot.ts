import Command from "../../classes/structs/Command";
import { EmbedBuilder, SlashCommandBuilder } from "discord.js";
import serverSchema from "#models/guild.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);
require("dayjs/locale/pt-br");
dayjs.locale("pt-br");

export default new Command({
  global: true,
  command: new SlashCommandBuilder()
    .setName("info")
    .setDescription("Informações gerais sobre a app e a The Black Lotus Assoc.")
    .setDescriptionLocalizations({
      "pt-BR": "Informações gerais sobre a app e a The Black Lotus Assoc.",
      "en-US": "General informations about the app and The Black Lotus Assoc.",
    }),
  async run({ client, interaction }) {
    const uptime = dayjs().add(client.uptime, "ms").fromNow(true);

    const embed = new EmbedBuilder()
      .setTitle(`Saiba mais! | The Black Lotus Assoc.`)
      .setFooter({
        text: `2024 © - The Black Lotus Assoc. - All rights reserved. | Created by: plary.`,
      })
      .setDescription(
        `Aproveite a sua visita para nos **conhecer melhor** e saber mais sobre o projeto que é a *The Black Lotus Assoc. *.\n\nVocê terá a oportunidade de explorar todos os aspectos do nosso projeto, desde a sua origem até as iniciativas atuais.\n\n**Descubra como estamos trabalhando para transformar e deixar nossa marca na comunidade do Discord.**\n*__Viste nosso site:__* [blacklotusassoc.org](https://blacklotusassoc.org/)\n\n`,
      )
      .addFields([
        {
          name: `<a:1_verified:1055293708825808947> Informacões gerais`,
          value: `- Atualmente em: ${client.guilds.cache.size} servidores.\n- Servidores membros: ${await serverSchema.countDocuments()} servidores.\n- Status do bot: <a:1_everythingisstable:1042548343852777523>\n- Tempo ativo: ${uptime} <a:1_possibleshutdown:1042547095430774935>`,
        },
      ])
      .setImage(
        "https://media.discordapp.net/attachments/1150106588758167694/1150174200812797962/bl.png?ex=666d5872&is=666c06f2&hm=287fba482e3f1fdc88019ea1550eda7947dc80ece5c6a0cf92e5d771545a023f&=&format=webp&quality=lossless&width=1440&height=512",
      )
      .setColor(0x404eed);

    await interaction.reply({
      embeds: [embed],
      ephemeral: false,
    });
  },
});
