import Command from "../../classes/structs/Command";
import { SlashCommandBuilder, PermissionFlagsBits, ModalBuilder, TextInputBuilder, ActionRowBuilder, userMention as k } from "discord.js";

const cooldowns = new Map();

export default new Command({
  global: true,
  command: new SlashCommandBuilder()
    .setName("candidatar-se")
    .setNameLocalizations({
      "pt-BR": "candidatar-se",
      "en-US": "apply",
    })
    .setDescription("Candidatar-se à The Black Lotus Assoc. / Black Syndicate")
    .setDescriptionLocalizations({
      "pt-BR": "Candidatar-se à The Black Lotus Assoc. / Black Syndicate",
      "en-US": "Apply to The Black Lotus Assoc. / Black Syndicate",
    })
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),
  async run({ interaction, client }) {
    const cooldownTime = 60000;
    const now = Date.now();
    const cooldownEnd = cooldowns.get(interaction.guildId) || 0;

    if (cooldownEnd > now) {
      const timeLeft = (cooldownEnd - now) / 1000;
      const roundedTimeLeft = Math.floor(parseFloat(timeLeft.toFixed(1)));
      return interaction.reply({ ephemeral: true, content: `<:warn:1251149443869184052> | ${k(interaction.user.id)}, *por razões de segurança*, o comando tem um tempo de espera. Por favor, aguarde **${roundedTimeLeft}** segundos e tente novamente.` });
    }

    cooldowns.set(interaction.guildId, now + cooldownTime);

    const result = await client.guildManager.fetch(interaction.guildId).catch(() => {});
    if (result && result.data.blacklisted) {
      return interaction.reply({
        content: `<:warn:1251149443869184052> | ${k(interaction.user.id)}, o servidor com o ID:\`${interaction.guildId}\` parece não ter permissão para ser cadastrado. *Caso acredite que isso seja um erro, entre em contato com o suporte.*`,
        ephemeral: true,
      });
    }

    if (await client.blackLotusManager.isPartOfBlackLotus(interaction.guildId)) {
      return interaction.reply({
        content: `<:alert:1251147737756340316> | ${k(interaction.user.id)}, o servidor com o ID: \`${interaction.guildId}\` já está cadastrado na base de dados. *Caso acredite que isso seja um erro, entre em contato com o suporte.*`,
        ephemeral: true,
      });
    }

    if (await client.syndicateManager.isPartOfBlackSyndicate(interaction.guildId)) {
      return interaction.reply({
        content: `<:alert:1251147737756340316> | ${k(interaction.user.id)}, o servidor com o ID: \`${interaction.guildId}\` já está cadastrado na base de dados. *Caso acredite que isso seja um erro, entre em contato com o suporte.*`,
        ephemeral: true,
      });
    }

    const ageInput = new TextInputBuilder().setCustomId("q1").setLabel("Idade do representante").setPlaceholder("A idade mínima segue os padrões dos TOS do Discord.").setStyle(1).setRequired(true).setMaxLength(2).setMinLength(2);
    const question1Input = new TextInputBuilder().setCustomId("q2").setLabel("Atividade do servidor").setPlaceholder("Como você descreveria a atividade do servidor em questão? (Ativo, parado, etc.)").setStyle(2).setRequired(true).setMaxLength(350).setMinLength(15);
    const question2Input = new TextInputBuilder().setCustomId("q3").setLabel("Projetos paralelos").setPlaceholder("Você ou seu servidor fazem parte de projetos paralelos? Se sim, quais? (EPF, EEE, etc.)").setStyle(2).setRequired(true).setMaxLength(350).setMinLength(5);
    const question3Input = new TextInputBuilder().setCustomId("q4").setLabel("The Black Lotus Assoc.").setPlaceholder("Por onde conheceu o trabalho da The Black Lotus Assoc.? (Site, servidor, conhecido, etc.)").setStyle(2).setRequired(true).setMaxLength(350).setMinLength(4);

    const row1 = new ActionRowBuilder<TextInputBuilder>().addComponents([ageInput]);
    const row2 = new ActionRowBuilder<TextInputBuilder>().addComponents([question1Input]);
    const row3 = new ActionRowBuilder<TextInputBuilder>().addComponents([question2Input]);
    const row4 = new ActionRowBuilder<TextInputBuilder>().addComponents([question3Input]);

    if (interaction.guild.memberCount < 100) {
      return interaction.reply({
        content: `O minimo de membros para poder se candidatar é de 100 membros. Atualmente o seu servidor possui ${interaction.guild.memberCount} membros.`,
        ephemeral: true,
      });
    }
    if (interaction.guild.memberCount < 3000) {
      const modal = new ModalBuilder().setCustomId(`candidatar-syndicate`).setTitle("Candidatura | Black Syndicate");
      modal.addComponents([row1, row2, row3, row4]);
      await interaction.showModal(modal);
    } else {
      const modal = new ModalBuilder().setCustomId(`candidatar-black`).setTitle("Candidatura | The Black Lotus Assoc.");
      modal.addComponents([row1, row2, row3, row4]);
      await interaction.showModal(modal);
    }
  },
});
