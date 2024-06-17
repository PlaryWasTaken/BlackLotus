import { ActionRowBuilder, ButtonBuilder, EmbedBuilder, TextChannel, userMention as k } from "discord.js";
const blacklotus = "986077595265282068";
const syndicate = "1199837537624146000";
import Event from "#structs/Event";

export default new Event().setData("modal.candidatar", async (client, interaction, args) => {
  await interaction.deferReply();
  const guild = client.blackLotus;

  if (!guild)
    return interaction.editReply({
      content: `<:warn:1251149443869184052> | Um erro ocorreu durante a execução da interação. *Contacte o suporte.*`,
    });

  const channel = interaction.guild.channels.cache.filter((v) => v.type === 0).first().id;
  const invite = await interaction.guild.invites
    .create(channel, {
      maxAge: 0,
      reason: "Criando convite para atualizar a base de dados.",
    })
    .catch(() => {
      interaction.editReply({
        content: `<:warn:1251149443869184052> | ${k(interaction.user.id)}, não foi possível criar um convite do servidor. Por favor, verifique minhas permissões. *Caso acredite que isso seja um erro, entre em contato com o suporte.*`,
      });
    });

  if (!invite) return;

  const mappings = {
    syndicate: "Syndicate",
    black: "Association",
  };
  const dim = {
    syndicate: "s",
    black: "a",
  };

  const embed = new EmbedBuilder()
    .setTitle(`Nova candidatura - ${interaction.guild.name} | ${mappings[args[0]]}`)
    .setFields([
      {
        name: "__**Enviado por:**__",
        value: `- ${k(interaction.user.id)}\n- **Username**: ${interaction.user.username}\n- **ID:** \`${interaction.user.id}\`\n- **Idade:** ${interaction.fields.getTextInputValue("q1")}`,
        inline: true,
      },
      {
        name: "__**Servidor:**__",
        value: `- **${interaction.guild.name}**\n- **ID:** \`${interaction.guild.id}\`\n- **Own. ID:** \`${interaction.guild.ownerId}\`\n- **Membros:** ${interaction.guild.memberCount.toString()}`,
        inline: true,
      },
      {
        name: "__**Atividade do Servidor:**__",
        value: interaction.fields.getTextInputValue("q2"),
      },
      {
        name: "__**Projetos paralelos:**__",
        value: interaction.fields.getTextInputValue("q3"),
      },
      {
        name: "__**Por onde conheceu a The Black Lotus Assoc.:**__",
        value: interaction.fields.getTextInputValue("q4"),
      },
    ])
    .setColor(0x404eed)
    .setImage("https://media.discordapp.net/attachments/1150106588758167694/1150174200812797962/bl.png?ex=666d5872&is=666c06f2&hm=287fba482e3f1fdc88019ea1550eda7947dc80ece5c6a0cf92e5d771545a023f&=&format=webp&quality=lossless&width=1440&height=512")
    .setFooter({
      text: "2024 © - The Black Lotus Assoc. - All rights reserved.",
    });

  const status = new ButtonBuilder().setCustomId(`status-${interaction.guild.id}-${invite.code}-${interaction.user.id}`).setEmoji("<a:1_possibleshutdown:1042547095430774935>").setStyle(1).setLabel(" ").setDisabled(true);
  const accept = new ButtonBuilder().setCustomId(`acceptServer-${interaction.guild.id}-${invite.code}-${interaction.user.id}-${dim[args[0]]}`).setEmoji("<a:1_verified:1055293708825808947>").setStyle(3).setLabel("Aceitar");
  const reject = new ButtonBuilder().setCustomId(`rejectServer-${interaction.guild.id}-${invite.code}-${interaction.user.id}-${dim[args[0]]}`).setEmoji("<:report_white:1251467928017305672>").setStyle(4).setLabel("Rejeitar");
  const link = new ButtonBuilder().setEmoji("<a:1_partner:1055605311534284800>").setStyle(5).setURL(invite.url).setLabel("Servidor");

  const actionRow = new ActionRowBuilder<ButtonBuilder>().setComponents([accept, reject, link, status]);

  let formChannel: TextChannel;

  if (args[0] === "syndicate") {
    const syndicateChat = guild.channels.cache.get(syndicate) as TextChannel | undefined;
    if (!syndicateChat)
      return interaction.editReply({
        content: `<:warn:1251149443869184052> | Um erro ocorreu durante a execução da interação. *Contacte o suporte.*`,
      });
    formChannel = syndicateChat;
  } else {
    const blackLotusChat = guild.channels.cache.get(blacklotus) as TextChannel | undefined;
    if (!blackLotusChat)
      return interaction.editReply({
        content: `<:warn:1251149443869184052> | Um erro ocorreu durante a execução da interação. *Contacte o suporte.*`,
      });
    formChannel = blackLotusChat;
  }

  const userEmbed = new EmbedBuilder()
    .setTitle(`Nova candidatura - ${interaction.guild.name} | ${mappings[args[0]]}`)
    .setDescription(`Olá ${k(interaction.user.id)},\n\n*Confirmamos com muito prazer o recebimento de sua candidatura.*\n\n**Gostaríamos de relembrar a importância de manter sua DM aberta e permanecer na central da** ***The Black Lotus Assoc.*** **para garantir o bom andamento do acompanhamento de sua candidatura.**\n\n*Aproveitamos também para convidá-lo a visitar nosso site para saber mais e ficar atualizado com todas as novidades!* [blacklotusassoc.org](https://blacklotusassoc.org/)`)
    .setFields([
      {
        name: "__**Informações pessoais:**__",
        value: `- ${k(interaction.user.id)}\n- **Username**: ${interaction.user.username}\n- **ID:** \`${interaction.user.id}\`\n- **Idade:** ${interaction.fields.getTextInputValue("q1")}`,
        inline: true,
      },
      {
        name: "__**Servidor**__",
        value: `- **${interaction.guild.name}**\n- **ID:** \`${interaction.guild.id}\`\n- **Own. ID:** \`${interaction.guild.ownerId}\`\n- **Membros:** ${interaction.guild.memberCount.toString()}`,
        inline: true,
      },
      {
        name: "__**Atividade do Servidor:**__",
        value: interaction.fields.getTextInputValue("q2"),
      },
      {
        name: "__**Projetos paralelos:**__",
        value: interaction.fields.getTextInputValue("q3"),
      },
      {
        name: "__**Por onde conheceu a The Black Lotus Assoc.:**__",
        value: interaction.fields.getTextInputValue("q4"),
      },
    ])
    .setColor(0x404eed)
    .setImage("https://media.discordapp.net/attachments/1150106588758167694/1150174200812797962/bl.png?ex=666d5872&is=666c06f2&hm=287fba482e3f1fdc88019ea1550eda7947dc80ece5c6a0cf92e5d771545a023f&=&format=webp&quality=lossless&width=1440&height=512")
    .setFooter({
      text: "2024 © - The Black Lotus Assoc. - All rights reserved.",
    });

  const support = new ButtonBuilder().setEmoji("<:1_add:1097618171982250135>").setStyle(5).setURL("https://discord.com/channels/896047806454837278/1121350824778534922").setLabel("Suporte");
  const tos = new ButtonBuilder().setEmoji("<a:1_moderator:1055605307365138462>").setStyle(5).setURL("https://blacklotusassoc.org/terms-of-service").setLabel("T.O.S");
  const faq = new ButtonBuilder().setEmoji("<:1_rules:1097618278060408872>").setStyle(5).setURL("https://blacklotusassoc.org/faq").setLabel("F.A.Q");
  const actionRowUser = new ActionRowBuilder<ButtonBuilder>().setComponents([support, tos, faq]);

    try {
      const member = await guild.members.fetch(interaction.user.id);
      const notVerified = member.roles.cache.some((role) => role.id === "896874533519237120");
    
      if (notVerified) {
        await member.roles.remove("896874533519237120");
      }
      
      await member.roles.add("897309181017722910");
    } catch (error) {
      if (error.code === 10007) {
        return interaction.editReply({
          content: `<:warn:1251149443869184052> | ${k(interaction.user.id)}, ** sua candidatura não pôde ser submetida.** *Ocorreu um erro ao tentar processar suas informações. Para que possamos dar prosseguimento à sua candidatura e manter contato, é necessário que você esteja presente na* **central** *da* ***The Black Lotus Assoc.***!\n\nPara mais informações, visite o nosso site: [blacklotusassoc.org](https://blacklotusassoc.org/)`,
        });
      } else {
        return interaction.editReply({
          content: `<:warn:1251149443869184052> | Um erro ocorreu durante a execução da interação. *Contacte o suporte.*`,
        });
      }
    }

    await interaction.user.send({
      embeds: [userEmbed],
      components: [actionRowUser],
    })
    .then(async () => {
      await interaction.editReply({
        content: `<a:1_verified:1055293708825808947> | ${k(interaction.user.id)}, a sua candidatura foi enviada com sucesso para a central da The Black Lotus Assoc.!\n\n**Nossa equipe irá verificar minuciosamente todas as informações fornecidas para garantir sua veracidade.** *Pedimos que aguarde enquanto sua candidatura é analisada.\n\nAgradecemos sua compreensão.*`,
      });
    })
    .catch(async (error) => {
      if (error.code === 50007) {
        return interaction.editReply({
          content: `<:warn:1251149443869184052> | ${k(interaction.user.id)}, **sua candidatura não pôde ser submetida.**\n\n*Ocorreu um erro ao tentar entrar em contato com você por mensagem direta.* Para que possamos dar prosseguimento à sua candidatura e mantermos contato, **é necessário que sua DM esteja aberta.**\n\nPara mais informações, visite o nosso site: [blacklotusassoc.org](https://blacklotusassoc.org/`,
        });
      } else {
        return interaction.editReply({
          content: `<:warn:1251149443869184052> | Um erro ocorreu durante a execução da interação. *Contacte o suporte.*`,
        });
      }
    });

    await formChannel.send({
      embeds: [embed],
      components: [actionRow],
    }); 
});
