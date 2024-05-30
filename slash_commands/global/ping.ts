import Command from "../../classes/structs/Command";
import {SlashCommandBuilder} from "discord.js";

export default new Command({
    global: true,
    command: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Comando para pingar o bot'),
    async run({client, interaction}) {
        await interaction.reply({ ephemeral: true, content: `Pong! ${client.ws.ping}ms`})
    }
})