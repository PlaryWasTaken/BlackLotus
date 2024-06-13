import Command from "../../classes/structs/Command";
import discord from "discord.js";
import serverModel from "#models/guild.js";

export default new Command({
    command: new discord.SlashCommandBuilder()
        .setName('remove')
        .setDescription('.')
        .setDefaultMemberPermissions(8)
        .addSubcommand(subcommand => subcommand
            .setName('server')
            .setDescription('Remove um servidor do banco de dados e da embed')
            .addStringOption(option => option
                .setName('id')
                .setDescription('Id do servidor')
                .setRequired(true)
                .setAutocomplete(true)
            )
        ),
    guilds: ["896047806454837278", "921162438001447023"],
    async run({client, interaction}) {
        const data = interaction.options.getString('id').split('-')
        const id = data[0]
        const isSyndicate = data[1] === 'true'
        if (isSyndicate) {
            await client.syndicateManager.delete(id).then(async () => {
                await interaction.reply({ephemeral: true, content: 'Servidor removido com sucesso'})
            }).catch(async (err) => {
                console.log(err)
                await interaction.reply({ephemeral: false, content: `Não achei esse servidor ou ocorreu um erro. Esquisito...\nDe qualquer modo aqui está o erro:\n\`\`\`${err}\`\`\``})
            })
        } else {
            await client.blackLotusManager.delete(id).then(async () => {
                await interaction.reply({ephemeral: true, content: 'Servidor removido com sucesso'})
            }).catch(async (err) => {
                console.log(err)
                await interaction.reply({ephemeral: false, content: `Não achei esse servidor ou ocorreu um erro. Esquisito...\nDe qualquer modo aqui está o erro:\n\`\`\`${err}\`\`\``})
            })
        }
    },
    async autocomplete({ interaction}) {
        const servers = await serverModel.find({ $or: [
                { "modules.blackLotus.displayName": new RegExp(interaction.options.getString('id'), 'i')},
                { "modules.syndicate.displayName": new RegExp(interaction.options.getString('id'), 'i')},
                {id: interaction.options.getString('id')},
            ]}).limit(25)
        const options = []
        servers.forEach(server => {
            if (!server.modules.blackLotus && !server.modules.syndicate) return
            const isSyndicate = !server.modules.blackLotus
            options.push({
                name: server.modules.blackLotus.displayName || server.modules.syndicate.displayName,
                value: `${server.id}-${isSyndicate}`
            })
        })
        await interaction.respond(options)
    }
})