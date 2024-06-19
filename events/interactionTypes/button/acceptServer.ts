import { 
  ColorResolvable, 
  EmbedBuilder, 
  ActionRowBuilder, 
  ButtonBuilder, 
  userMention as k ,
  roleMention as m,
  TextChannel
} from "discord.js";

import Event from "#structs/Event";
function randomColor() {
  let color = "#";
  for (let i = 0; i < 6; i++) {
    const random = Math.random();
    const bit = (random * 16) | 0;
    color += bit.toString(16);
  }
  return color;
}

export default new Event().setData("button.acceptServer", async (client, interaction, args) => {
  await interaction.deferReply({
    ephemeral: true,
  });

  const guild = client.guilds.cache.get(args[0]);
  const inviteCode = args[1];

  const central = client.blackLotus;
  const welcome = central.channels.cache.get("1094449076533198859") as TextChannel | undefined;

  const mappings = {
    s: "Syndicate",
    a: "Association",
  };

  const status = new ButtonBuilder().setCustomId(`disabled`).setEmoji("<a:1_everythingisstable:1042548343852777523>").setStyle(1).setLabel(" ").setDisabled(true);

  const accept = new ButtonBuilder().setCustomId(`disabled2`).setEmoji("<a:1_verified:1055293708825808947>").setStyle(3).setLabel("Aceitar").setDisabled(true);

  const reject = new ButtonBuilder().setCustomId(`disabled3`).setEmoji("<:report_white:1251467928017305672>").setStyle(4).setLabel("Rejeitar").setDisabled(true);

  const link = new ButtonBuilder().setEmoji("<a:1_partner:1055605311534284800>").setStyle(5).setURL(`https://discord.gg/${args[1]}`).setLabel("Servidor");

  const support = new ButtonBuilder().setEmoji("<:1_add:1097618171982250135>").setStyle(5).setURL("https://discord.com/channels/896047806454837278/1121350824778534922").setLabel("Suporte");
  const tos = new ButtonBuilder().setEmoji("<a:1_moderator:1055605307365138462>").setStyle(5).setURL("https://blacklotusassoc.org/terms-of-service").setLabel("T.O.S");
  const faq = new ButtonBuilder().setEmoji("<:1_rules:1097618278060408872>").setStyle(5).setURL("https://blacklotusassoc.org/faq").setLabel("F.A.Q");

  const actionRowUser = new ActionRowBuilder<ButtonBuilder>().setComponents([support, tos, faq]);

  const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents([accept, reject, link, status]);

  const divPermRoleId = "1154855047625195530";
  const permRole = central.roles.cache.get(divPermRoleId);
  const interactionUser = await central.members.fetch(interaction.user.id);
  const hasPermission = interactionUser.roles.cache.some((role) => role.position > permRole.position);

  if (hasPermission) {
    const member = await central.members.fetch(args[2]).catch(() => {});

    if (!member) {
      const embed = new EmbedBuilder(interaction.message.embeds[0].data)
        .setTitle(`*Candidatura recusada* - ${guild.name} | ${mappings[args[3]]}`)
        .setColor(0xb71616)
        .addFields([
          {
            name: "__**Candidatura recusada**__",
            value: `- **Recusado por:**: ${interaction.user.username}\n- **ID:** \`${interaction.user.id}\`\n- **Motivo:** O representante \`${args[2]}\` saiu da central.`,
            inline: true,
          },
        ]);
      await interaction.message.edit({
        embeds: [embed],
        components: [actionRow],
      });
      return interaction.editReply({ content: `<a:1_verified:1055293708825808947> | O representante não se encontra na central. A candidatura foi recusada automaticamente! ***Não foi possível notificar o representante.***` });
    }

    if (guild.memberCount < 3000) {
      const server = await client.syndicateManager
        .create({
          id: guild.id,
          repId: args[2],
          invite: inviteCode,
        })
        .catch(() => {});

      if (!server) {
        return interaction.editReply({ content: `<:alert:1251147737756340316> | ${k(interaction.user.id)}, o servidor com o ID: \`${guild.id}\` já está cadastrado na base de dados. *Caso acredite que isso seja um erro, entre em contato com o suporte.*` });
      }

      await member.roles.add(["1246148641446690817", "897108319175581746"]);
      const notVerified = member.roles.cache.some((role) => role.id === "896874533519237120");
      if (notVerified) {
        await member.roles.remove("896874533519237120");
      }
      await member.roles.remove("897309181017722910");
      const embedUserS = new EmbedBuilder()
        .setTitle(`Aviso referente a candidatura | ${guild.name}`)
        .setDescription(
          `Olá ${k(args[2],)},\n\nAgradecemos pelo seu interesse em fazer parte da **The Black Lotus Assoc.**! Recebemos um grande número de inscrições e, após ***uma revisão cuidadosa***, temos o prazer de informar que sua candidatura a **__Black Syndicate__** foi aprovada!\n\n*Parabéns por essa conquista, e estamos empolgados em tê-lo a bordo.* **Se tiver alguma dúvida ou precisar de informações adicionais, não hesite em entrar em contato.**\n\n*Mais uma vez, agradecemos pelo seu tempo e interesse. Desejamos a você sucesso em suas futuras empreitadas!*\n\nAtenciosamente,\n*The Black Lotus* ***Team***`,
        )
        .setColor(0x404eed)
        .setImage("https://media.discordapp.net/attachments/1150106588758167694/1150174200812797962/bl.png?ex=666d5872&is=666c06f2&hm=287fba482e3f1fdc88019ea1550eda7947dc80ece5c6a0cf92e5d771545a023f&=&format=webp&quality=lossless&width=1440&height=512");
      await member.send({
          embeds: [embedUserS],
          components: [actionRowUser],
        })
        .catch(() => {});

      await interaction
        .editReply({
          content: `<a:1_verified:1055293708825808947> | A candidatura foi aprovada com sucesso! ${guild.name.length < 25 ? "" : "\n<:warn:1251149443869184052> | O servidor não aparecerá na embed por ter um nome com mais de 25 caracteres."}`,
        })
        .catch(async () => {
          await interaction.channel.send({
            content: `<:warn:1251149443869184052> | Um erro ocorreu durante a execução da interação. *Contacte o suporte.*`,
          });
        });

      const embed = new EmbedBuilder(interaction.message.embeds[0].data)
        .setTitle(`*Candidatura aprovada* - ${guild.name} | ${mappings[args[3]]}`)
        .setColor(0x49a561)
        .addFields([
          {
            name: "__**Candidatura aprovada**__",
            value: `- **Aprovado por:**: ${interaction.user.username}\n- **ID:** \`${interaction.user.id}\``,
            inline: true,
          },
        ]);

        if (welcome) {
          await welcome.send({
            content:`<a:1_verified:1055293708825808947> **|** O servidor ${guild.name} \`${guild.id}\` teve sua candidatura *analisada e aprovada*, e agora faz oficialmente parte da **Black Syndicate**! Seja muito bem-vindo ${k(args[2],)}`
        })
        }

      await interaction.message.edit({
        embeds: [embed],
        components: [actionRow],
      });

      client.emit("syndicate.serverAccept", server.id);

      return;
    }

    const server = await client.blackLotusManager
      .create({
        id: guild.id,
        repId: args[2],
        invite: inviteCode,
      })
      .catch(() => {});

    if (!server) {
      return interaction.editReply({ content: `<:alert:1251147737756340316> | ${k(interaction.user.id)}, o servidor com o ID: \`${guild.id}\` já está cadastrado na base de dados. *Caso acredite que isso seja um erro, entre em contato com o suporte.*` });
    }

    const constellation = await server.constellation.fetch();
    const constellationRole = await central.roles.fetch(constellation.roleId).catch(() => {});

    if (!constellationRole) {
      await server.delete().catch(() => {});
      return interaction.followUp({ content: "Não foi possível encontrar o cargo de constelacão" });
    }

    const newRole = await central.roles.create({
      name: guild.name,
      reason: `Candidatura aprovada | ${guild.id}`,
      permissions: 0n,
      position: constellationRole.position - 1,
      color: randomColor() as ColorResolvable,
    });

    await member.roles.add([newRole, constellationRole.id, "897108319175581746"]);
    server.data.modules.blackLotus.role = newRole.id;
    await member.roles.remove("897309181017722910");
    await server.data.save();
    const embedUserA = new EmbedBuilder()
      .setTitle(`Aviso referente a candidatura | ${guild.name}`)
      .setDescription(
        `Olá ${k(args[2])},\n\nAgradecemos pelo seu interesse em fazer parte da **The Black Lotus Assoc.**! Recebemos um grande número de inscrições e, após ***uma revisão cuidadosa***, temos o prazer de informar que sua candidatura ao **__ramo principal da associação__** foi aprovada!\n\n*Parabéns por essa conquista, e estamos empolgados em tê-lo a bordo.* **Se tiver alguma dúvida ou precisar de informações adicionais, não hesite em entrar em contato.**\n\n*Mais uma vez, agradecemos pelo seu tempo e interesse. Desejamos a você sucesso em suas futuras empreitadas!*\n\nAtenciosamente,\n*The Black Lotus* ***Team***`,
      )
      .setColor(0x404eed)
      .setImage("https://media.discordapp.net/attachments/1150106588758167694/1150174200812797962/bl.png?ex=666d5872&is=666c06f2&hm=287fba482e3f1fdc88019ea1550eda7947dc80ece5c6a0cf92e5d771545a023f&=&format=webp&quality=lossless&width=1440&height=512");

    await member.send({
        embeds: [embedUserA],
        components: [actionRowUser],
      })
      .catch(() => {});

    await interaction
      .followUp({
        ephemeral: true,
        content: `<a:1_verified:1055293708825808947> | A candidatura foi aprovada com sucesso! ${guild.name.length < 25 ? "" : "\n<:warn:1251149443869184052> | O servidor não aparecerá na embed por ter um nome com mais de 25 caracteres."}`,
      })
      .catch(async () => {
        await interaction.channel.send({
          content: `<:warn:1251149443869184052> | Um erro ocorreu durante a execução da interação. *Contacte o suporte.*`,
        });
      });

      if (welcome) {
        await welcome.send({
          content:`<a:1_verified:1055293708825808947> **|** O servidor ${guild.name} \`${guild.id}\` teve sua candidatura *analisada e aprovada*, e agora faz oficialmente parte da **The Black Lotus Assoc.**! Sejam muito bem-vindos ${m(newRole.id)}`
      })
      }

    const embed = new EmbedBuilder(interaction.message.embeds[0].data)
      .setTitle(`*Candidatura aprovada* - ${guild.name} | ${mappings[args[3]]}`)
      .setColor(0x49a561)
      .addFields([
        {
          name: "__**Candidatura aprovada**__",
          value: `- **Aprovado por:**: ${interaction.user.username}\n- **ID:** \`${interaction.user.id}\``,
          inline: true,
        },
      ]);

    await interaction.message.edit({
      embeds: [embed],
      components: [actionRow],
    });

    client.emit("blacklotus.serverAccept", server.id);

    return;
  } else {
    interaction.editReply({
      content: `<:warn:1251149443869184052> | ${k(interaction.user.id)} você não tem permissão para executar essa interação! *Caso acredite que isso seja um erro, entre em contato com o suporte.*`,
    });
  }
});
