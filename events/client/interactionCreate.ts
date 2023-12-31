import Event from '../../classes/structs/Event.js'
export default new Event().setData("interactionCreate", async (client, interaction) => {
    if (interaction.isModalSubmit()) {
        const split = interaction.customId.split('-')
        const name = split.shift()
        client.emit(`modal.${name}`, interaction, split)
        return
    }
    if (interaction.isChatInputCommand()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;
        try {
            await command.run({client, interaction});
        } catch (error) {
            client.logger.error(error);
            if (!interaction.replied) await interaction.reply({
                content: 'Ocorreu um erro ao executar esse comando!',
                ephemeral: true
            });
            else await interaction.followUp({content: 'Ocorreu um erro ao executar esse comando!', ephemeral: true});
        }
        return
    }
    if (interaction.isAutocomplete()) {
        const command = client.slashCommands.get(interaction.commandName);
        if (!command) return;
        if (!command.autocomplete) return
        try {
            await command.autocomplete({client, interaction});
        } catch (error) {
            client.logger.error(error);
            if (!interaction.responded) await interaction.respond([{
                name: 'Ocorreu um erro!',
                value: 'error'
            }]);
            else return
        }
        return
    }
    if (interaction.isButton()) {
        const args = interaction.customId.split('-')
        client.emit(`button.${args.shift()}`, interaction, args)
    }
})