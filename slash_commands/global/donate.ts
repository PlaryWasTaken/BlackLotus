import Command from "../../classes/structs/Command";
import {EmbedBuilder, SlashCommandBuilder} from "discord.js";


export default new Command({
    global: true,
    command: new SlashCommandBuilder()
        .setName('doar')
        .setNameLocalizations({
            'pt-BR': 'doar',
            'en-US': 'donate'
        })
        .setDescription('Doar dinheiro para a black lotus, para ajudar a manter o bot online'),
    async run({interaction}) {
        const embed = new EmbedBuilder()
            .setTitle(`Ko-fi`)
            .setURL('https://ko-fi.com/plary')
            .setDescription('Clique no título para doar')
            .setThumbnail('https://uploads-ssl.webflow.com/5c14e387dab576fe667689cf/64f1a9ddd0246590df69e9ef_ko-fi_logo_02-p-500.png')
        await interaction.reply({embeds: [embed], ephemeral: true})
    }
})