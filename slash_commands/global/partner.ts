import Command from "../../classes/structs/Command";
import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    CategoryChannel,
    TextInputBuilder,
    ModalBuilder,
    ActionRowBuilder
} from 'discord.js';
import serverModel from "#models/guild.js";
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import BlackLotusGuild from "#structs/BlackLotusGuild";
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);
dayjs.updateLocale('en', {
    relativeTime: {
        future: "em %s",
        past: "%s atrás",
        s: 'alguns segundos',
        m: "Um minuto",
        mm: "%d minutos",
        h: "Uma hora",
        hh: "%d horas",
        d: "Um dia",
        dd: "%d dias",
        M: "Um Mês",
        MM: "%d meses",
        y: "Um ano",
        yy: "%d anos"
    }
})


export default new Command({
    global: true,
    command: new SlashCommandBuilder()
        .setName('partner')
        .setNameLocalizations({
            'pt-BR': 'parceria',
            'en-US': 'partner'
        })
        .setDescription('Comando para gerenciar as parcerias com o bot da black')
        .addSubcommand(subcommand =>
            subcommand
                .setName('enviar')
                .setNameLocalizations({
                    'pt-BR': 'enviar',
                    'en-US': 'send'
                })
                .setDescription('Envie sua mensagem de parceria em mais de 50 servidores')
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('registrar')
                .setNameLocalizations({
                    'pt-BR': 'registrar',
                    'en-US': 'register'
                })
                .setDescription('Registre seu servidor no sistema de parcerias')
                .addRoleOption(option => option.setName('mencao').setDescription('Cargo que será marcado ao fazer uma parceria').setRequired(true))
                .addChannelOption(option => option.setName('chat').setDescription('Chat que será utilizado para fazer as parcerias').setRequired(true))
                .addStringOption(option => option.setName('texto').setDescription('Texto de parcerias de seu servidor').setRequired(true))

        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('notificar')
                .setNameLocalizations({
                    'pt-BR': 'notificar',
                    'en-US': 'notify'
                })
                .setDescription('Notifique o representante do servidor quando você pode enviar novamente a mensagem de parceria')
                .addBooleanOption(option => option.setName('notificar').setDescription('Notificar o representante do servidor quando você pode enviar novamente a mensagem de parceria').setRequired(true))
        )
        .addSubcommandGroup(subcommandgroup => subcommandgroup.setName('editar')
            .setNameLocalizations({
                'pt-BR': 'editar',
                'en-US': 'edit'
            })
            .setDescription('Edite o seu registro')
            .addSubcommand(
                subcommand => subcommand
                    .setName('testar')
                    .setNameLocalizations({
                        'pt-BR': 'testar',
                        'en-US': 'test'
                    })
                    .setDescription('Envia a sua mensagem de parceria de volta para você')
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('mencao')
                    .setNameLocalizations({
                        'pt-BR': 'mencao',
                        'en-US': 'mention'
                    })
                    .setDescription('Edite qual cargo é mencionado')
                    .addRoleOption(option =>
                        option.setName('mencao')
                            .setRequired(true)
                            .setDescription('Selecione um cargo que será mencionado quando o bot fizer uma parceria')
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('chat')
                    .setNameLocalizations({
                        'pt-BR': 'chat',
                        'en-US': 'chat'
                    })
                    .setDescription('Edit qual chat é usado')
                    .addChannelOption(option =>
                        option.setName('chat')
                            .setRequired(true)
                            .setDescription('Selecione um chat')
                    )
            )
            .addSubcommand(subcommand =>
                subcommand
                    .setName('mensagem')
                    .setNameLocalizations({
                        'pt-BR': 'mensagem',
                        'en-US': 'message'
                    })
                    .setDescription('Edite a mensagem de parcerias que é enviada')
            )
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
    async run({client, interaction}) {
        if (!await serverModel.findOne({ id: interaction.guild.id })) return interaction.reply({ ephemeral: true, content: `Este commando é apenas para participantes da Black蓮` })
        let guildData = await client.blackLotusManager.fetch(interaction.guild.id).catch(() => { })
        if (!guildData) return interaction.reply({ ephemeral: true, content: `Você não é membro da Black蓮 (Servidores da Black Syndicate não podem usar deste sistema neste momento)` })
        switch (interaction.options.getSubcommand()) {
            case 'testar':
                if (!guildData.partnerships) return interaction.reply({ ephemeral: true, content: 'Você não pode usar esse comando ainda!' })
                await interaction.reply({ content: `Sua mensagem apareceria assim em outros servidores:\n\n>>> ${guildData.partnerships.message}\nRep:<@961408139469660210>`, ephemeral: true })
                break;
                case 'notificar':
                    if (!guildData.partnerships) return interaction.reply({ ephemeral: true, content: 'Você não pode usar esse comando ainda!' })
                    guildData.partnerships.notify = interaction.options.getBoolean('notificar')
                    guildData.data.modules.partnerships.notify = interaction.options.getBoolean('notificar')
                    await guildData.data.save()
                    await interaction.reply({ content: `Notificar o representante do servidor quando você puder enviar novamente a mensagem de parceria foi alterado para: ${interaction.options.getBoolean('notificar') ? 'Ativado' : 'Desativado'}`, ephemeral: true })
                break;
            case 'enviar':
                if (!guildData.partnerships) return interaction.reply({ ephemeral: true, content: 'Você não pode usar esse comando ainda!' })
                if (!guildData.partnerships.canUse()) return interaction.reply({ ephemeral: true, content: `Você está em cooldown por favor espere mais ${dayjs(guildData.partnerships.timer).toNow(true)}` })
                let guildsData = await serverModel.find({})
                let time = Math.trunc(guildsData.length * 3 / 60)
                await interaction.reply({ ephemeral: true, content: `Estou enviando as mensagens para todos os servidores. Tempo estimado: ${time} - ${time + 1} Minutos` })
                const result = await guildData.partnerships.sendAll()
                    .catch(async err => {
                        if (err === 'cooldown') return await interaction.followUp({ ephemeral: true, content: `Você está em cooldown por favor espere mais ${dayjs((guildData as BlackLotusGuild).partnerships.timer).toNow(true)}` })
                        await interaction.followUp({ephemeral: true, content: 'Seu servidor não está pronto para enviar parcerias, Erro Encontrado: ' + err})
                    })
                if (!result) return
                guildData.data.modules.partnerships.notified = false
                await guildData.data.save()
                await interaction.followUp({ ephemeral: true, content: 'Enviei sua parceria para todos os servidores registrados!' })
                break;
            case 'mencao':
                if (!guildData.partnerships) return interaction.reply({ ephemeral: true, content: 'Você não pode usar esse comando ainda!' })
                if (guildData.id !== interaction.guild.id) return interaction.reply({ ephemeral: true, content: 'Você deve utilizar este comando em seu servidor!' })
                const cargo = interaction.options.getRole('mencao')
                guildData.data.modules.partnerships.mentionId = cargo.id
                await guildData.data.save()
                interaction.reply({ ephemeral: true, content: `Troquei com sucesso o cargo que será mencionado para: ${cargo.name}` })
                break;
            case 'chat':
                if (!guildData.partnerships) return interaction.reply({ ephemeral: true, content: 'Você não pode usar esse comando ainda!' })
                if (guildData.id !== interaction.guild.id) return interaction.reply({ ephemeral: true, content: 'Você deve utilizar este comando em seu servidor!' })
                const chat = interaction.options.getChannel('chat')
                guildData.data.modules.partnerships.channelId = chat.id
                await guildData.data.save()
                interaction.reply({ ephemeral: true, content: `Troquei com sucesso o chat que será utlizado para: ${chat.name}` })
                break;
            case 'mensagem':
                if (!guildData.partnerships) return interaction.reply({ ephemeral: true, content: 'Você não pode usar esse comando ainda!' })
                const modal = new ModalBuilder().setCustomId(`messageChange-${guildData.id}`).setTitle('Editar mensagem de parceria')
                const modalActionRow = new ActionRowBuilder<TextInputBuilder>().addComponents([new TextInputBuilder().setCustomId('messageInput').setLabel('Texto de parcerias').setStyle(2).setRequired(true)])
                modal.addComponents(modalActionRow)
                await interaction.showModal(modal)
                break;
            case 'registrar':
                if (guildData.partnerships) return interaction.reply({ ephemeral: true, content: `O seu servidor já está registrado!`})
                const chatRegistro = interaction.options.getChannel('chat')
                const cargoRegistro = interaction.options.getRole('mencao')
                const textoRegistro = interaction.options.getString('texto')
                if (!(chatRegistro as CategoryChannel).isTextBased()) return interaction.reply({ ephemeral: true, content: 'O chat selecionado não é um chat de texto!' })
                guildData.data.modules.partnerships = {
                    channelId: chatRegistro.id,
                    mentionId: cargoRegistro.id,
                    message: textoRegistro,
                    timer: guildData.data.modules.partnerships.timer || 0,
                    notify: guildData.data.modules.partnerships.notify || false,
                    notified: guildData.data.modules.partnerships.notified || false
                }
                await guildData.data.save()
                interaction.reply({ ephemeral: true, content: `Seu servidor foi registrado com sucesso!` })
                break;
            default:
                break;
        }
    }
})