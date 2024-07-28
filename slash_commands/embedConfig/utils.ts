import Command from "../../classes/structs/Command";

import discord, { AutocompleteInteraction } from "discord.js";
import constellationModel from "#models/constellation";
import serverModel, { GuildDocument } from "#models/guild.js";

export default new Command({
  command: new discord.SlashCommandBuilder()
    .setName("utilitário")
    .setDefaultMemberPermissions(8)
    .setNameLocalizations({
      "pt-BR": "utilitário",
      "en-US": "utilities",
    })
    .setDescription("Utils commands")
    .addSubcommandGroup((group) =>
      group
        .setName("verifyinvites")
        .setDescription("Black Lotus commands")
        .addSubcommand((subcommand) =>
          subcommand
            .setName("associação")
            .setDescription("Verifica todos o invite de todos servidores da constelacão")
            .addStringOption((option) =>
              option
                .setName("constelacão")
                .setDescription("Nome da constelacão")
                .setRequired(true)
                .setAutocomplete(true),
            ),
        ),
    ),
  guilds: ["896047806454837278"],
  async run({ client, interaction }) {
    const subcommand = interaction.options.getSubcommand();
    switch (subcommand) {
      case "associação":
        {
          const constellation = interaction.options.getString("constelacão");
          const servers = await serverModel.find({
            "modules.blackLotus.constellation": constellation,
          });
          servers.sort((a, b) =>
            a.modules.blackLotus.displayName.localeCompare(b.modules.blackLotus.displayName),
          );
          let chunked: GuildDocument[][] = [];
          const size = 10;
          for (let i = 0; i < servers.length; i += size) {
            chunked.push(servers.slice(i, i + size) as GuildDocument[]);
          }
          chunked.sort((a, b) => a.length - b.length);
          const chunkedErrors = [];
          await interaction.reply({ content: "Verificando...", ephemeral: true });
          for (const chunk of chunked) {
            const errors = [];
            for (const server of chunk) {
              const guild = client.guilds.cache.get(server.id);
              if (!guild) continue;
              if (
                !guild.members.me.permissions.has(discord.PermissionsBitField.Flags.ManageGuild)
              ) {
                errors.push(
                  `\`${server.modules.blackLotus.displayName}\` - Sem permissão de ver invites, Invite: ${server.modules.blackLotus.invite}`,
                );
                continue;
              }
              const invite = await guild.invites
                .fetch(server.modules.blackLotus.invite)
                .catch(() => {
                  errors.push(
                    `O servidor \`${server.modules.blackLotus.displayName}\` esta com o invite invalido, Note: isso não é um erro grave e pode ser ignorado`,
                  );
                });
              if (invite) continue;
              const newInvite = await guild.invites
                .create(
                  guild.rulesChannelId ||
                    guild.channels.cache.filter((v) => v.type === 0).first().id,
                  {
                    maxAge: 0,
                    maxUses: 0,
                    temporary: false,
                    unique: true,
                  },
                )
                .catch(() => {});
              if (!newInvite) {
                errors.push(
                  `O servidor \`${guild.name}\` (Id: ${guild.id})não me deu permissão de criar um invite e tem o invite expirado!`,
                );
                continue;
              }
              server.modules.blackLotus.invite = newInvite.url;
              await server.save();
            }
            chunkedErrors.push(errors);
          }
          await interaction.channel.send({
            content: `Invites Verificados, Erros:${chunkedErrors
              .map((v, i) => {
                return v.length > 0 ? `${i} -\n${v.join("\n")}\n\n` : "";
              })
              .join("\n\n")}`,
          });
        }
        break;
    }
  },
  async autocomplete({ interaction }) {
    await HandleAutoCompleteConstellation(interaction);
  },
});

export async function HandleAutoCompleteConstellation(interaction: AutocompleteInteraction) {
  const servers = await constellationModel
    .find({ name: new RegExp(interaction.options.getString("constelacão"), "i") })
    .limit(25);
  const options = [];
  servers.forEach((constellation) => {
    options.push({
      name: constellation.name,
      value: constellation._id + "",
    });
  });
  await interaction.respond(options);
}
