import Command from "../../classes/structs/Command";

import discord from "discord.js";
import constellationModel from "../../models/constelationModel";
import serverModel from "../../models/guildDataModel";
export default new Command({
    command: new discord.SlashCommandBuilder()
        .setName("verifyinvites")
        .setDescription("Verifica todos o invite de todos servidores da constelacão")
        .addStringOption(option => option
            .setName("constelacão")
            .setDescription("Nome da constelacão")
            .setRequired(true)
            .setAutocomplete(true)
        ),
    guilds: ["896047806454837278", "921162438001447023"],
    async run({client, interaction}) {
        const constellation = interaction.options.getString('constelacão')
        const servers = await serverModel.find({"blackLotus.constelation": constellation})
        servers.sort((a, b) => a.blackLotus.displayName.localeCompare(b.blackLotus.displayName))
        let chunked = []
        const size = 10;
        for (let i = 0; i < servers.length; i += size) {
            chunked.push(servers.slice(i, i + size))
        }
        chunked.sort((a, b) => a.length - b.length)
        const chukedErrors = []
        await interaction.reply({content: 'Verificando...', ephemeral: true})
        for (const chunk of chunked) {
            const errors = []
            for (const server of chunk) {
                const guild = client.guilds.cache.get(server.id)
                if (!guild) continue
                if (!guild.members.me.permissions.has(discord.PermissionsBitField.Flags.ManageGuild)) {
                    errors.push(`\`${server.blackLotus.displayName}\` - Sem permissão de ver invites, Invite: ${server.blackLotus.invite}`)
                    continue
                }
                const invite = await guild.invites.fetch(server.blackLotus.invite).catch(() => {
                    errors.push(`O servidor \`${server.blackLotus.displayName}\` esta com o invite invalido, Note: isso não é um erro grave e pode ser ignorado`)
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
                server.blackLotus.invite = newInvite.url
                await server.save()
            }
            chukedErrors.push(errors)
        }
        await interaction.channel.send({content: `Invites Verificados, Erros:${chukedErrors.map((v,i) => { return v.length > 0?`${i} -\n${v.join('\n')}\n\n`:''}).join('\n\n')}`})
    },
    async autocomplete({client, interaction}) {
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
})