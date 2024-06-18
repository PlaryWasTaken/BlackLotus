import Event from "#structs/Event.js";
export default new Event().setData(
  "interactionCreate",
  async (client, interaction) => {
    if (interaction.isModalSubmit()) {
      const split = interaction.customId.split("-");
      const name = split.shift();
      client.emit(`modal.${name}`, interaction, split);
      return;
    }
    if (interaction.isChatInputCommand()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;
      for (const option of interaction.options.data) {
        if (option.value === "error.")
          return await interaction.reply({
            content:
              "Não foi possivel buscar os dados referentes para rodar o comando",
            ephemeral: true,
          });
      }
      try {
        await command.run({ client, interaction });
      } catch (error) {
        client.logger.error(error);
        if (!interaction.replied)
          await interaction.reply({
            content:
             `<:warn:1251149443869184052> | Um erro ocorreu durante a execução do commando '**${command.name}**'. *Contacte o suporte.*`,
            ephemeral: true,
          });
        else
          await interaction.followUp({
            content:
              `<:warn:1251149443869184052> | Um erro ocorreu durante a execução do commando '**${command.name}**'. *Contacte o suporte.*`,
            ephemeral: true,
          });
      }
      return;
    }
    if (interaction.isAutocomplete()) {
      const command = client.slashCommands.get(interaction.commandName);
      if (!command) return;
      if (!command.autocomplete)
        return client.logger.error(
          `Comand ${command.name} defines autocomplete but does not have a function for it`
        );
      try {
        await command.autocomplete({ client, interaction });
      } catch (error) {
        client.logger.error(error);
        if (!interaction.responded)
          await interaction.respond([
            {
              name: "Ocorreu um erro!",
              value: "error.",
            },
          ]);
        else return;
      }
      return;
    }
    if (interaction.isButton()) {
      const args = interaction.customId.split("-");
      client.emit(`button.${args.shift()}`, interaction, args);
    }
  }
);
