import Command from "#structs/Command";

const {SlashCommandBuilder} = require("discord.js");
import {ActionRowBuilder, ButtonBuilder} from "discord.js";
import BlackLotusGuild from "#structs/BlackLotusGuild";
import SyndicateGuild from "#structs/SyndicateGuild";
export default new Command({
    global: true,
    command: new SlashCommandBuilder()
        .setName('rename')
        .setNameLocalizations({
            'pt-BR': 'renomear',
            'en-US': 'rename'
        })
        .setDefaultMemberPermissions(8)
        .setDescription('Renomeie o seu servidor na embed da Black Lótus')
        .setDescriptionLocalizations({
            'pt-BR': 'Renomeie o seu servidor na embed da Black Lótus',
            'en-US': 'Rename how your server is displayed in the Black Lotus embed'
        })
        .addStringOption(option => option
            .setName('name')
            .setNameLocalizations({
                'pt-BR': 'nome',
                'en-US': 'name'
                })
            .setDescription('Novo nome do servidor')
            .setDescriptionLocalizations({
                'pt-BR': 'Novo nome do servidor',
                'en-US': 'New name for the server'
                })
                .setMaxLength(25)
            .setRequired(true)
            ),
    async run({client, interaction}) {
        let guild = await client.blackLotusManager.fetch(interaction.guild.id).catch(() => {
        }) as void | BlackLotusGuild | SyndicateGuild
        if (guild) {
            guild.data.modules.blackLotus.displayName = interaction.options.getString('name')
            guild.data.modules.blackLotus.trackNameChanges = false
            guild.data.modules.blackLotus.embedWorthy = true
        } else {
            guild = await client.syndicateManager.fetch(interaction.guild.id).catch(() => {}) as SyndicateGuild // We dont care about the original type, since down the line it just uses the document to save
            if (!guild) return await interaction.reply({ephemeral: true, content: 'Esse servidor não está na Black Lótus'})
            guild.data.modules.syndicate.displayName = interaction.options.getString('name')
            guild.data.modules.syndicate.trackNameChanges = false
            guild.data.modules.syndicate.embedWorthy = true
        }
        const actionRow = new ActionRowBuilder<ButtonBuilder>()
            .setComponents([
                new ButtonBuilder()
                    .setCustomId('no')
                    .setLabel('Não')
                    .setStyle(4),
                new ButtonBuilder()
                    .setCustomId('yes')
                    .setLabel('Sim')
                    .setStyle(3)
            ])
        const msg = await interaction.reply({
            ephemeral: true,
            content: '**ATENCÃO: Ao utilizar esse comando mudancas no nome do seu servidor não serão mais automaticas**\nDeseja prosseguir com a mudança de nome?',
            fetchReply: true,
            components: [actionRow]
        })
        const filter = (button) => button.user.id === interaction.user.id
        msg.awaitMessageComponent({filter, time: 60000}).then(async (button) => {
            if (button.customId === 'yes') {
                await (guild as BlackLotusGuild | SyndicateGuild).data.save().then(async () => {
                    await button.reply({
                        content: 'Nome alterado com sucesso',
                        components: [],
                        ephemeral: true
                    })
                }).catch(async (err) => {
                    console.log(err)
                    await button.reply({
                        content: 'Ocorreu um erro ao alterar o nome',
                        components: [],
                        ephemeral: true
                    })
                })
            } else {
                await button.reply({
                    content: 'Operação cancelada',
                    components: [],
                    ephemeral: true
                })
            }
        }).catch(() => {})

    }
})