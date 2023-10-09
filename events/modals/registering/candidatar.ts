import {ActionRowBuilder, ButtonBuilder, EmbedBuilder, TextChannel} from "discord.js";
const chat = '986077595265282068'
import Event from "../../../classes/structs/Event";
export default new Event().setData("modal.candidatar", async (client, interaction) => {
    const guild = client.blackLotus
    if (!guild) return interaction.reply({ephemeral: true, content: `Tente novamente`})
    const channel = interaction.guild.channels.cache.filter(v => v.type === 0).first().id
    const invite = await interaction.guild.invites.create(channel, {
        maxAge: 0,
        reason: "Criando invite para black lotus"
    }).catch(() => {
        interaction.reply({ephemeral: true, content: `O bot não tem perm de criar invites`})
    })
    if (!invite) return
    const embed = new EmbedBuilder().setTitle(`Candidatura de ${interaction.user.tag}`)
        .setFields([
            {name: 'ID Representante', value: interaction.user.id, inline: true},
            {name: 'Tag', value: interaction.user.tag, inline: true},
            {name: 'Idade', value: interaction.fields.getTextInputValue('age'), inline: true},
            {name: '\u200B', value: '\u200B'},
            {name: 'Nome Servidor', value: interaction.guild.name, inline: true},
            {name: 'ID Servidor', value: interaction.guild.id, inline: true},
            {name: 'Qnt. Membros', value: interaction.guild.memberCount.toString(), inline: true},
            {name: 'Invite', value: invite.url, inline: true},
            {name: '\u200B', value: '\u200B'},
            {name: 'Tem outras aliancas', value: interaction.fields.getTextInputValue('question1'), inline: true},
        ])
        .setColor('#ffaaff')
    const accept = new ButtonBuilder().setCustomId(`acceptServer-${interaction.guild.id}-${invite.code}-${interaction.user.id}`).setEmoji('<:aprove:942479368276541471>').setStyle(3).setLabel('Aceitar')
    const reject = new ButtonBuilder().setCustomId(`rejectServer-${interaction.guild.id}-${invite.code}-${interaction.user.id}`).setEmoji('<:reject:942479368091996200>').setStyle(4).setLabel('Rejeitar')
    const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents([accept, reject])
    const blackLotusChat = guild.channels.cache.get(chat) as TextChannel|undefined
    if (!blackLotusChat) return interaction.reply({ephemeral: true, content: `Tente novamente`})
    const msg = await blackLotusChat.send({embeds: [embed], components: [actionRow]})
    interaction.user.send({content: `Sua candidatura foi enviada com sucesso, Por Favor mantenha o privado aberto para que eu possa te convidar caso seja aceito`})
        .then(async () => {
            await interaction.reply({ephemeral: true, content: `Enviei sua candidatura para a Black 蓮`})
        })
        .catch(async () => {
            await interaction.reply({
                ephemeral: true,
                content: `Seu privado precisa estar aberto para poder se candidatar!`
            })
            await msg.delete()
        })
})