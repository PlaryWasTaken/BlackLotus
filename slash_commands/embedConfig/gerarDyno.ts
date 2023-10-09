import Command from "../../classes/structs/Command";

import discord from 'discord.js';
import constellationModel from "../../models/constelationModel";
import serverModel from "../../models/guildDataModel";

export default new Command({
    command: new discord.SlashCommandBuilder()
        .setName('gerardyno')
        .setDefaultMemberPermissions(8)
        .setNameLocalizations({
            'en-US': 'generatedyno',
            'pt-BR': 'gerardyno'
        })
        .setDescription('Gera a mensagem de invite para ser usada no dyno')
        .setDescriptionLocalizations({
            'en-US': 'Generates the invite message to be used in dyno',
            'pt-BR': 'Gera a mensagem de invite para ser usada no dyno'
        })
        .addStringOption(option => option
            .setName('constelacão')
            .setDescription('Nome da constelacão')
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
            const file = { attachment: Buffer.from(msg),name: `${i}.txt`}
            files.push(file)
        }
        await interaction.reply({content: 'Aqui estão os txts', ephemeral: true, files: files})
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