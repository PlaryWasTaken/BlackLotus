import Command from "../../classes/structs/Command";

import {SlashCommandBuilder, PermissionFlagsBits} from 'discord.js';
import serverModel from '#models/guild.js';
import discord from 'discord.js';
export default new Command({
    global: true,
    command: new SlashCommandBuilder()
        .setName('sair')
        .setDescription('Comando para sair da black lotus sem ter que chamar um membro da staff')
        .addStringOption(option => option.setName('motivo').setDescription('Motivo para sair').setRequired(true).setMinLength(10).setMaxLength(600))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async run({client, interaction}) {
        const data = await serverModel.findOne({ id: interaction.guild.id })
        if (!data) return interaction.reply({ ephemeral: true, content: `Este commando é apenas para participantes da Black蓮` })
        if (interaction.user.id !== data.modules.blackLotus.representant) return interaction.reply({ ephemeral: true, content: `Comando apenas para o representante do servidor`})
        const motivo = interaction.options.getString('motivo')
        const embed = new discord.EmbedBuilder()
            .setTitle(`Saida de um integrante, Servidor ${interaction.guild.name}`)
            .setDescription(`O membro ${interaction.user} da guilda ${interaction.guild.name} (Id: ${interaction.guild.id}) saiu da black lotus com o motivo: ${motivo}`)
            .setColor('#ff0000')
            .setTimestamp()
        await client.blackLotusManager.delete(interaction.guild.id)
        await client.logChannel.send({ embeds: [embed] })
        await interaction.reply({ ephemeral: true, content: `Você saiu da black lotus com sucesso!` })
    }
})