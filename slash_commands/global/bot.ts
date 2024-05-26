import Command from "../../classes/structs/Command";

import {EmbedBuilder, SlashCommandBuilder} from 'discord.js';
import serverSchema from '#models/guild.js';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime)
require('dayjs/locale/pt-br')
dayjs.locale('pt-br')
export default new Command({
    global: true,
    command: new SlashCommandBuilder()
        .setName('bot')
        .setDescription('Informações sobre o bot e suas funcões')
        .addSubcommand(group => group
            .setName('info')
            .setDescription('Informações sobre o bot')
        ),
    async run({client, interaction}) {
        const uptime = dayjs().add(client.uptime, 'ms').fromNow(true)
        const embed = new EmbedBuilder()
            .setTitle(`Informacões sobre o bot e a Black Lótus`)
            .setFooter({ text: `Criado por: Plary#1993`})
            .addFields([
                { name: 'Informacões gerais', value: `
                Servidores que adicionaram o bot: ${client.guilds.cache.size}
                Servidores atualmente na black lotus: ${await serverSchema.countDocuments()}
                Status do bot: Ativo
                Tempo ativo: ${uptime}
                `}
            ])
        await interaction.reply({embeds: [embed], ephemeral: true})
    }
})