import Command from "../../classes/structs/Command";

import {SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, ActionRowBuilder} from 'discord.js';
export default new Command({
    global: true,
    command: new SlashCommandBuilder()
        .setName('candidatar-se')
        .setNameLocalizations({
            'pt-BR': 'candidatar-se',
            'en-US': 'apply'
        })
        .setDescription('Comando para se candidatar para a Black 蓮')
        .setDescriptionLocalizations({
            'pt-BR': 'Comando para se candidatar para a Black 蓮',
            'en-US': 'Command to apply to join Black 蓮'
        })
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async run({ interaction, client}) {
        const result = await client.guildManager.fetch(interaction.guildId).catch(() => {})
        if (result) {
            if (result.data.blacklisted) return interaction.reply({ ephemeral: true, content: `Seu servidor foi banido da Black 蓮` })
            return interaction.reply({ ephemeral: true, content: `Você já é membro da Black 蓮` })
        }
        if (interaction.guild.memberCount < 2900) return interaction.reply({ ephemeral: true, content: `O servidor precisa ter pelo menos 3000 membros para se candidatar` })
        const modal = new ModalBuilder().setCustomId(`candidatar-${interaction.user.id}-${interaction.guild.id}`).setTitle('Candidatar-se')
        const ageInput = new TextInputBuilder().setCustomId('age').setLabel('Quantos anos você tem?').setStyle(1).setRequired(true).setMaxLength(30).setMinLength(2)
        const question1Input = new TextInputBuilder().setCustomId('question1').setLabel('Você tem outras alianças?').setStyle(2).setRequired(true).setMaxLength(350)
        const question2Input = new TextInputBuilder().setCustomId('question2').setLabel('Quantos membros entram por dia?').setStyle(1).setRequired(true).setMaxLength(350)
        const question3Input = new TextInputBuilder().setCustomId('question3').setLabel('Como é a movimentação?').setStyle(1).setRequired(true).setMaxLength(350)
        const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents([ageInput])
        const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents([question1Input])
        const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents([question2Input])
        const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents([question3Input])
        modal.addComponents([row1, row3, row4, row2])
        await interaction.showModal(modal)
    }
})