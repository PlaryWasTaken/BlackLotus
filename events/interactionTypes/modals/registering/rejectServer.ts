import Event from "#structs/Event";
import { EmbedBuilder, userMention as k, ActionRowBuilder, ButtonBuilder } from "discord.js";

export default new Event().setData("modal.rejectServer", async (client, interaction, args) => {
  await interaction.deferReply({
    ephemeral: true,
  });

  const user = await client.users.fetch(args[1]).catch(() => {});

  const guild = await client.guilds.fetch(args[0]).catch(() => {});
  if (!guild)
    return interaction.editReply({
      content: `Tente novamente, o servidor não foi encontrado`,
    });

  const central = client.blackLotus;

  const mappings = {
    s: "Syndicate",
    a: "Association",
  };

  const embed = new EmbedBuilder()
    .setTitle(`Aviso referente a candidatura | ${guild.name}`)
    .setDescription(
      `Olá ${k(
        args[1],
      )}\n\nAgradecemos pelo seu interesse em fazer parte da **The Black Lotus Assoc.**! Recebemos um grande número de inscrições e, após ***uma revisão cuidadosa***, lamentamos informar que, não poderemos convidá-lo para uma próxima etapa em nossa associação.\n\nNo entanto, encorajamos você a continuar nos acompanhando e a considerar se candidatar novamente no futuro.\n\n*Mais uma vez, agradecemos pelo seu tempo e interesse. Desejamos a você sucesso em suas futuras empreitadas!* Abaixo, você pode ler detalhadamente os motivos da recusa.\n\n__**Motivo:**__ ${
        interaction.fields.getTextInputValue("rejectServerReason") || "O motivo não foi fornecido."
      }\n\nAtenciosamente,\n*The Black Lotus* ***Team***`,
    )
    .setColor(0x404eed)
    .setImage("https://media.discordapp.net/attachments/1150106588758167694/1150174200812797962/bl.png?ex=666d5872&is=666c06f2&hm=287fba482e3f1fdc88019ea1550eda7947dc80ece5c6a0cf92e5d771545a023f&=&format=webp&quality=lossless&width=1440&height=512");

  const originalEmbed = new EmbedBuilder(interaction.message.embeds[0].data)
    .setTitle(`*Candidatura recusada* - ${guild.name} | ${mappings[args[3]]}`)
    .setColor(0xb71616)
    .addFields([
      {
        name: "__**Candidatura recusada**__",
        value: `- **Recusado por:**: ${interaction.user.username}\n- **ID:** \`${interaction.user.id}\`\n- **Motivo:** ${interaction.fields.getTextInputValue("rejectServerReason") || "O motivo não foi fornecido."}`,
        inline: true,
      },
    ]);

  const status = new ButtonBuilder().setCustomId(`disabled`).setEmoji("<a:1_laydowntorest:1042548347715727390>").setStyle(1).setLabel(" ").setDisabled(true);

  const accept = new ButtonBuilder().setCustomId(`disabled2`).setEmoji("<a:1_verified:1055293708825808947>").setStyle(3).setLabel("Aceitar").setDisabled(true);

  const reject = new ButtonBuilder().setCustomId(`disabled3`).setEmoji("<:report_white:1251467928017305672>").setStyle(4).setLabel("Rejeitar").setDisabled(true);

  const link = new ButtonBuilder().setEmoji("<a:1_partner:1055605311534284800>").setStyle(5).setURL(`https://discord.gg/${args[4]}`).setLabel("Servidor");

  const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents([accept, reject, link, status]);

  const specifiedRoleID = "897309181017722910";
  const specifiedRole = central.roles.cache.get(specifiedRoleID);

  const member = await central.members.fetch(args[1]).catch(() => {});
  if (!member) {
    return;
  } else {
    const hasHigherRole = member.roles.cache.some((role) => role.position > specifiedRole.position);

    if (hasHigherRole) {
      await member.roles.remove(specifiedRole).catch(console.error);
    } else {
      await member.kick(`Candidatura rejeitada | ${guild.id}`).catch(console.error);
    }
  }

  if (user) {
    await user.send({
      embeds: [embed],
    });
    await interaction.editReply({
      content: "<a:1_verified:1055293708825808947> | A candidatura foi recusada com sucesso! *O representante foi notificado com êxito.*",
    });
  } else {
    await interaction.editReply({
      content: "<a:1_verified:1055293708825808947> | A candidatura foi recusada com sucesso! ***Não foi possível notificar o representante porque a DM do mesmo está fechada.***",
    });
  }

  await interaction.message.edit({
    embeds: [originalEmbed],
    components: [actionRow],
  });

  client.emit("blacklotus.serverReject");
});
