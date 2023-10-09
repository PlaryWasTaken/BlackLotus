import Command from "../../classes/structs/Command";
import discord from "discord.js";
import serverModel from "../../models/guildDataModel";

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
        const id = interaction.options.getString('id')
        await client.guildManager.delete(id).then(async () => {
            await interaction.reply({ephemeral: true, content: 'Servidor removido com sucesso'})
        }).catch(async (err) => {
            console.log(err)
            await interaction.reply({ephemeral: false, content: `Não achei esse servidor ou ocorreu um erro. Esquisito...\nDe qualquer modo aqui está o erro:\n\`\`\`${err}\`\`\``})
        })
    },
    async autocomplete({client, interaction}) {
        const servers = await serverModel.find({ $or: [{ "blackLotus.displayName": new RegExp(interaction.options.getString('id'), 'i')}, {id: interaction.options.getString('id')}]}).limit(25)
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