import Command from "../../classes/structs/Command";

import discord, {AutocompleteInteraction} from 'discord.js';
import constellationModel from "#models/constelation";
import serverModel, {GuildDocument} from "#models/guild.js";

export default new Command({
    command: new discord.SlashCommandBuilder()
        .setName('utils')
        .setDefaultMemberPermissions(8)
        .setNameLocalizations({
            'en-US': 'utils',
            'pt-BR': 'utils'
        })
        .setDescription('Utils commands')
        .addSubcommandGroup(group => group
            .setName('blacklotus')
            .setDescription('Black Lotus commands')
            .addSubcommand(subcommand => subcommand
                .setName("gerardyno")
                .setDescription("Gera os txts para o dyno")
                .addStringOption(option => option
                    .setName('constelacão')
                    .setDescription('Nome da constelacão')
                    .setRequired(true)
                    .setAutocomplete(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName("verifyinvites")
                .setDescription("Verifica todos o invite de todos servidores da constelacão")
                .addStringOption(option => option
                    .setName("constelacão")
                    .setDescription("Nome da constelacão")
                    .setRequired(true)
                    .setAutocomplete(true)
                )
            )
        ),
    guilds: ["896047806454837278", "921162438001447023"],
    async run({client, interaction}) {
        const subcommand = interaction.options.getSubcommand()
        switch (subcommand) {
            case 'gerardyno': {
                const constellation = interaction.options.getString('constelacão')
                const servers = await serverModel.find({"modules.blackLotus.constelation": constellation})
                servers.sort((a, b) => a.modules.blackLotus.displayName.localeCompare(b.modules.blackLotus.displayName))
                let chunked = []
                const size = 10;
                for (let i = 0; i < servers.length; i += size) {
                    chunked.push(servers.slice(i, i + size))
                }
                chunked.sort((a, b) => b.length - a.length)
                const msgStart = `Junte-se também ao nosso servidor parceiro! 🤍\n**Nitro • Sorteios • Chats ativos • Amizades • Muito mais!**`
                const msgEnd = `https://i.imgur.com/UhQP3Nx.png`
                let i = 0
                const files = []
                for (const chunk of chunked) {
                    i++
                    let msg = msgStart
                    for (const server of chunk) {
                        msg += `\n${server.blackLotus.invite}`
                    }
                    msg += `\n\n${msgEnd}`
                    // await interaction.channel.send(msg)
                    const file = {attachment: Buffer.from(msg), name: `${i}.txt`}
                    files.push(file)
                }
                await interaction.reply({content: 'Aqui estão os txts', ephemeral: true, files: files})
            }
                break;
            case 'verifyinvites': {
                const constellation = interaction.options.getString('constelacão')
                const servers = await serverModel.find({"module.blackLotus.constelation": constellation})
                servers.sort((a, b) => a.modules.blackLotus.displayName.localeCompare(b.modules.blackLotus.displayName))
                let chunked: GuildDocument[][] = []
                const size = 10;
                for (let i = 0; i < servers.length; i += size) {
                    chunked.push(servers.slice(i, i + size) as GuildDocument[])
                }
                chunked.sort((a, b) => a.length - b.length)
                const chunkedErrors = []
                await interaction.reply({content: 'Verificando...', ephemeral: true})
                for (const chunk of chunked) {
                    const errors = []
                    for (const server of chunk) {
                        const guild = client.guilds.cache.get(server.id)
                        if (!guild) continue
                        if (!guild.members.me.permissions.has(discord.PermissionsBitField.Flags.ManageGuild)) {
                            errors.push(`\`${server.modules.blackLotus.displayName}\` - Sem permissão de ver invites, Invite: ${server.modules.blackLotus.invite}`)
                            continue
                        }
                        const invite = await guild.invites.fetch(server.modules.blackLotus.invite).catch(() => {
                            errors.push(`O servidor \`${server.modules.blackLotus.displayName}\` esta com o invite invalido, Note: isso não é um erro grave e pode ser ignorado`)
                        })
                        if (invite) continue
                        const newInvite = await guild.invites.create(guild.rulesChannelId || guild.channels.cache.filter(v => v.type === 0).first().id, {
                            maxAge: 0,
                            maxUses: 0,
                            temporary: false,
                            unique: true,
                        }).catch(() => {
                        })
                        if (!newInvite) {
                            errors.push(`O servidor \`${guild.name}\` (Id: ${guild.id})não me deu permissão de criar um invite e tem o invite expirado!`)
                            continue
                        }
                        server.modules.blackLotus.invite = newInvite.url
                        await server.save()
                    }
                    chunkedErrors.push(errors)
                }
                await interaction.channel.send({
                    content: `Invites Verificados, Erros:${chunkedErrors.map((v, i) => {
                        return v.length > 0 ? `${i} -\n${v.join('\n')}\n\n` : ''
                    }).join('\n\n')}`
                })
            }
                break;
        }
    },
    async autocomplete({interaction}) {
        await HandleAutoCompleteConstellation(interaction)
    }

})

export async function HandleAutoCompleteConstellation(interaction: AutocompleteInteraction) {
    const servers = await constellationModel.find({"name": new RegExp(interaction.options.getString('constelacão'), 'i')}).limit(25)
    const options = []
    servers.forEach(constellation => {
        options.push({
            name: constellation.name,
            value: constellation._id + ''
        })
    })
    await interaction.respond(options)
}