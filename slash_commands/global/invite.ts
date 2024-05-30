import Command from "../../classes/structs/Command";

import discord from 'discord.js';
export default new Command({
    global: true,
    command: new discord.SlashCommandBuilder()
        .setName('invite')
        .setNameLocalizations({
            'en-US': 'invite',
            'pt-BR': 'convite'
        })
        .setDefaultMemberPermissions(8)
        .setDescription('0')
        .addSubcommand(
            group => group
                .setName('mudar')
                .setDescription('Use esse comando para mudar o chat de convite')
                .addChannelOption(option => option
                    .setName('canal')
                    .setDescription('Canal que você quer que seja o chat de convite')
                    .setRequired(true)
                )
        ),
    async run({client, interaction}) {
        const subCommand = interaction.options.getSubcommand()
        if (subCommand === 'mudar') {
            const channel = interaction.options.getChannel('canal')
            if (channel.type !== 0) return interaction.reply({ephemeral: true, content: `O canal precisa ser um canal de texto`})
            const guild = await client.blackLotusManager.fetch(interaction.guild.id).catch(() => {})
            if (!guild) return interaction.reply({ephemeral: true, content: `Você não é membro da Black 蓮`})
            const invite = await interaction.guild.invites.create(channel.id, {maxAge: 0, maxUses: 0, temporary: false, unique: false, reason: `Mudança de canal de convite`}).catch(() => {
            })
            if (!invite) return interaction.reply({ephemeral: true, content: `Ocorreu um erro ao criar um invite, pode ser que eu não tenha permissão de criar invites no canal selecionado`})
            guild.data.modules.blackLotus.invite = invite.url
            await guild.data.save()
            await interaction.reply({ephemeral: true, content: `O chat de convite foi mudado para ${channel}`})
        }
    }
})