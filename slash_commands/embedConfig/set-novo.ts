import Command from "../../classes/structs/Command";

import {SlashCommandBuilder, PermissionFlagsBits} from "discord.js";
import serverModel from '../../models/guildDataModel';

export default new Command({
    guilds: ["896047806454837278", "921162438001447023"],
    command: new SlashCommandBuilder()
        .setName('set')
        .setDescription('.')
        .setNameLocalizations(
            {
                'pt-BR': 'configurar',
                'en-US': 'set',
            }
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommandGroup(group => group
            .setName('servidores')
            .setNameLocalizations({
                'pt-BR': 'servidores',
                'en-US': 'servers'
            })
            .setDescription('Comandos para gerenciar servidores')
            .setDescriptionLocalizations({
                    'pt-BR': 'Comandos para gerenciar servidores',
                    'en-US': 'Commands to manage servers'
                }
            )
            .addSubcommand(subcommand => subcommand
                .setName('aparecerembed')
                .setNameLocalizations({
                    'pt-BR': 'aparecerembed',
                    'en-US': 'appearembed'
                })
                .setDescription('Comando para fazer com que o servidor apareça no embed')
                .setDescriptionLocalizations({
                    'pt-BR': 'Comando para fazer com que o servidor apareça no embed',
                    'en-US': 'Command to make the server appear in the embed'
                })
                .addBooleanOption(
                    option => option
                        .setName('aparecer')
                        .setNameLocalizations({
                            'pt-BR': 'aparecer',
                            'en-US': 'appear'
                        })
                        .setDescription('Se o servidor deve aparecer no embed')
                        .setDescriptionLocalizations({
                            'pt-BR': 'Se o servidor deve aparecer no embed',
                            'en-US': 'If the server should appear in the embed'
                        })
                        .setRequired(true)
                )
                .addStringOption(option => option
                    .setName('servidor')
                    .setNameLocalizations({
                        'pt-BR': 'servidor',
                        'en-US': 'server'
                    })
                    .setDescription('Id do servidor')
                    .setRequired(true)
                    .setAutocomplete(true)
                )
            )
            .addSubcommand(
                subcommand => subcommand
                    .setName('rastrearmembros')
                    .setNameLocalizations({
                        'pt-BR': 'rastrearmembros',
                        'en-US': 'trackmembers'
                    })
                    .setDescription('NÃO MEXE SE N SOUBER OQ ISSO FAZ')
                    .setDescriptionLocalizations({
                        'pt-BR': 'NÃO MEXE SE N SOUBER OQ ISSO FAZ',
                        'en-US': 'DON\'T TOUCH IF YOU DON\'T KNOW WHAT THIS DOES'
                    })
                    .addBooleanOption(
                        option => option
                            .setName('rastrear')
                            .setNameLocalizations({
                                'pt-BR': 'rastrear',
                                'en-US': 'track'
                            })
                            .setDescription('Se o servidor deve ser rastreado')
                            .setDescriptionLocalizations({
                                'pt-BR': 'Se o servidor deve ser rastreado',
                                'en-US': 'If the server should be tracked'
                            })
                            .setRequired(true)
                    )
                    .addStringOption(option => option
                        .setName('servidor')
                        .setNameLocalizations({
                            'pt-BR': 'servidor',
                            'en-US': 'server'
                        })
                        .setDescription('Id do servidor')
                        .setRequired(true)
                        .setAutocomplete(true)
                    )
            )
            .addSubcommand(subcommand => subcommand
                .setName('representante')
                .setNameLocalizations({
                    'pt-BR': 'representante',
                    'en-US': 'representative'
                })
                .setDescription('Seta o representante do servidor')
                .setDescriptionLocalizations({
                    'pt-BR': 'Seta o representante do servidor',
                    'en-US': 'Sets the server representative'
                })
                .addUserOption(option => option
                    .setName('user')
                    .setNameLocalizations({
                        'pt-BR': 'usuário',
                        'en-US': 'user'
                    })
                    .setDescription('Membro a ser setado como representante')
                    .setRequired(true))
                .addStringOption(option => option
                    .setName('servidor')
                    .setNameLocalizations({
                        'pt-BR': 'servidor',
                        'en-US': 'server'
                    })
                    .setDescription('Id do servidor')
                    .setRequired(true)
                    .setAutocomplete(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('cargo')
                .setNameLocalizations(
                    {
                        'pt-BR': 'cargo',
                        'en-US': 'role'
                    }
                )
                .setDescription('Seta o cargo do servidor')
                .setDescriptionLocalizations({
                    'pt-BR': 'Seta o cargo do servidor',
                    'en-US': 'Sets the server role'
                })
                .addRoleOption(option => option
                    .setName('cargo')
                    .setNameLocalizations(
                        {
                            'pt-BR': 'cargo',
                            'en-US': 'role'
                        }
                    )
                    .setDescription('Cargo a ser setado como cargo do servidor')
                    .setRequired(true)
                )
                .addStringOption(option => option
                    .setName('servidor')
                    .setNameLocalizations({
                        'pt-BR': 'servidor',
                        'en-US': 'server'
                    })
                    .setDescription('Id do servidor')
                    .setRequired(true)
                    .setAutocomplete(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('staff')
                .setNameLocalizations({
                    'pt-BR': 'staff',
                    'en-US': 'staff'
                })
                .setDescription('Seta um user como staff do servidor escolhido')
                .setDescriptionLocalizations({
                    'pt-BR': 'Seta um user como staff do servidor escolhido',
                    'en-US': 'Sets a user as staff of the chosen server'
                })
                .addUserOption(option => option
                    .setName('user')
                    .setDescription('Membro a ser setado como staff')
                    .setRequired(true))
                .addStringOption(option => option
                    .setName('servidor')
                    .setNameLocalizations({
                        'pt-BR': 'servidores',
                        'en-US': 'servers'
                    })
                    .setDescription('Id do servidor')
                    .setRequired(true)
                    .setAutocomplete(true)
                )
                .addStringOption(option => option
                    .setName('cargo')
                    .setNameLocalizations({
                        'pt-BR': 'cargo',
                        'en-US': 'role'
                    })
                    .setDescription('Cargo do staff')
                    .setRequired(true)
                    .setChoices(
                        {
                            name: 'Sub Owner',
                            value: '897930829756497950'
                        },
                        {
                            name: 'Admin',
                            value: '897108127768535051'
                        },
                        {
                            name: 'Moderador',
                            value: '897108216721334283'
                        },
                        {
                            name: 'Staffs',
                            value: '986019185089978428'
                        }
                    )
                )
            )
        )
        .addSubcommandGroup(group => group
            .setName('embed')
            .setNameLocalizations({
                'pt-BR': 'embed',
                'en-US': 'embed'
            })
            .setDescription('Comandos para gerenciar embeds')
            .setDescriptionLocalizations({
                'pt-BR': 'Comandos para gerenciar embeds',
                'en-US': 'Commands to manage embeds'
            })
            .addSubcommand(subcommand => subcommand
                .setName('cor')
                .setNameLocalizations({
                    'pt-BR': 'cor',
                    'en-US': 'color'
                })
                .setDescription('Seta a cor do embed')
                .setDescriptionLocalizations({
                    'pt-BR': 'Seta a cor do embed',
                    'en-US': 'Sets the embed color'
                })
                .addStringOption(option => option
                    .setName('cor')
                    .setNameLocalizations({
                        'pt-BR': 'cor',
                        'en-US': 'color'
                    })
                    .setDescription('Cor do embed')
                    .setRequired(true)
                    .setMaxLength(7)
                    .setMinLength(7)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('titulo')
                .setNameLocalizations({
                    'pt-BR': 'titulo',
                    'en-US': 'title'
                })
                .setDescription('Seta o título do embed')
                .setDescriptionLocalizations({
                    'pt-BR': 'Seta o título do embed',
                    'en-US': 'Sets the embed title'
                })
                .addStringOption(option => option
                    .setName('titulo')
                    .setNameLocalizations({
                        'pt-BR': 'titulo',
                        'en-US': 'title'
                    })
                    .setDescription('Título do embed')
                    .setRequired(true)
                    .setMaxLength(256)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('descricao')
                .setNameLocalizations({
                    'pt-BR': 'descricao',
                    'en-US': 'description'
                })
                .setDescription('Seta a descrição do embed')
                .setDescriptionLocalizations({
                    'pt-BR': 'Seta a descrição do embed',
                    'en-US': 'Sets the embed description'
                })
                .addStringOption(option => option
                    .setName('descricao')
                    .setNameLocalizations({
                        'pt-BR': 'descricao',
                        'en-US': 'description'
                    })
                    .setDescription('Descrição do embed')
                    .setRequired(true)
                    .setMaxLength(2048)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('imagem')
                .setNameLocalizations({
                    'pt-BR': 'imagem',
                    'en-US': 'image'
                })
                .setDescription('Seta a imagem do embed')
                .setDescriptionLocalizations({
                    'pt-BR': 'Seta a imagem do embed',
                    'en-US': 'Sets the embed image'
                })
                .addStringOption(option => option
                    .setName('imagem')
                    .setNameLocalizations({
                        'pt-BR': 'imagem',
                        'en-US': 'image'
                    })
                    .setDescription('Imagem do embed')
                    .setRequired(true)
                    .setMaxLength(2048)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('prefixo')
                .setNameLocalizations({
                    'pt-BR': 'prefixo',
                    'en-US': 'prefix'
                })
                .setDescription('Seta o prefixo que aparece antes da constelação')
                .setDescriptionLocalizations({
                    'pt-BR': 'Seta o prefixo que aparece antes da constelação',
                    'en-US': 'Sets the prefix that appears before the constellation'
                })
                .addStringOption(option => option
                    .setName('prefixo')
                    .setNameLocalizations({
                        'pt-BR': 'prefixo',
                        'en-US': 'prefix'
                    })
                    .setDescription('Prefixo da constelação')
                    .setRequired(true)
                    .setMaxLength(256)
                )
            )
        ),
    async run({client, interaction}) {
        if (interaction.user.id === '1021932527037980673') return interaction.reply({
            content: 'Você não tem permissão para usar esse comando',
            ephemeral: true
        })
        switch (interaction.options.getSubcommand()) {
            case 'representante':
                const user = interaction.options.getUser('user')
                const id = interaction.options.getString('servidor')
                const data1 = await serverModel.findOne({id: id})
                if (!data1) return interaction.reply({
                    ephemeral: true,
                    content: `Este servidor não está na black lotus`
                })
                data1.blackLotus.representant = user.id
                await data1.save()
                await interaction.reply({
                    ephemeral: true,
                    content: `O representante do servidor ${data1.blackLotus.displayName} foi setado para ${user}`
                })
                break;
            case 'cargo':
                const role = interaction.options.getRole('cargo')
                const guildId3 = interaction.options.getString('servidor')
                const data2 = await serverModel.findOne({id: guildId3})
                if (!data2) return interaction.reply({
                    ephemeral: true,
                    content: `Este servidor não está na black lotus`
                })
                data2.blackLotus.role = role.id
                await data2.save()
                await interaction.reply({
                    ephemeral: true,
                    content: `O cargo do servidor ${data2.blackLotus.displayName} foi setado para ${role}`
                })
                break;
            case 'cor':
                const color = interaction.options.getString('cor')
                if (!/^#[A-Fa-f0-9]+$/g.test(color)) return interaction.reply({
                    ephemeral: true,
                    content: `Cor inválida`
                })
                client.mainEmbed.message.color = color
                await interaction.reply({ephemeral: true, content: `A cor do embed foi setada para ${color}`})
                client.mainEmbed.message.save()
                break;
            case 'titulo':
                const title = interaction.options.getString('titulo')
                client.mainEmbed.message.title = title
                await interaction.reply({ephemeral: true, content: `O título do embed foi setado para ${title}`})
                client.mainEmbed.message.save()
                break;
            case 'descricao':
                const description = interaction.options.getString('descricao')
                client.mainEmbed.message.description = description
                await interaction.reply({
                    ephemeral: true,
                    content: `A descrição do embed foi setada para ${description}`
                })
                client.mainEmbed.message.save()
                break;
            case 'imagem':
                const image = interaction.options.getString('imagem')
                client.mainEmbed.message.image = image
                await interaction.reply({ephemeral: true, content: `A imagem do embed foi setada para ${image}`})
                client.mainEmbed.message.save()
                break;
            case 'prefixo':
                const prefix = interaction.options.getString('prefixo')
                client.mainEmbed.message.fieldNamePrefix = prefix
                await interaction.reply({
                    ephemeral: true,
                    content: `O prefixo da constelação foi setado para ${prefix}`
                })
                client.mainEmbed.message.save()
                break;
            case 'staff':
                const user2 = interaction.options.getUser('user')
                const guildId2 = interaction.options.getString('servidor')
                const cargo = interaction.options.getString('cargo')
                const data3 = await serverModel.findOne({id: guildId2})
                if (!data3) return interaction.reply({
                    ephemeral: true,
                    content: `Este servidor não está na black lotus`
                })
                if (data3.blackLotus.staffs.find(e => e.id === user2.id)) return interaction.reply({
                    content: 'Este usuário já é staff desse servidor',
                    ephemeral: true
                })
                data3.blackLotus.staffs.push({id: user2.id, role: cargo})
                await data3.save()
                await interaction.reply({
                    content: `O usuário ${user2} foi setado como staff do servidor ${data3.blackLotus.displayName}`,
                    ephemeral: true
                })
                break;
            case 'aparecerembed':
                const guildId = interaction.options.getString('servidor')
                const data = await serverModel.findOne({id: guildId})
                if (!data) return interaction.reply({
                    ephemeral: true,
                    content: `Este servidor não está na black lotus`
                })
                data.blackLotus.embedWorthy = interaction.options.getBoolean('aparecer')
                await data.save()
                await interaction.reply({
                    ephemeral: true,
                    content: `O servidor ${data.blackLotus.displayName} agora ${interaction.options.getBoolean('aparecer') ? 'aparece' : 'não aparece'} no embed`

                })
                break;
        }
    },
    async autocomplete({interaction}) {
        const servers = await serverModel.find({$or: [{"blackLotus.displayName": new RegExp(interaction.options.getString('servidor'), 'i')}, {id: interaction.options.getString('servidor')}]}).limit(25)
        const options = []
        servers.forEach(server => {
            options.push({
                name: server.blackLotus.displayName,
                value: server.id
            })
        })
        await interaction.respond(options)
    }
})