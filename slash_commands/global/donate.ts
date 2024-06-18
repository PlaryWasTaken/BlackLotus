import Command from "../../classes/structs/Command";
import {EmbedBuilder, SlashCommandBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle} from "discord.js";

export default new Command({
    global: true,
    command: new SlashCommandBuilder()
        .setName("doar")
        .setNameLocalizations({"pt-BR": "doar", "en-US": "donate"})
        .setDescription("Faça uma doação voluntária e contribua com o crescimento da The Black Lotus Assoc.")
        .setDescriptionLocalizations({
            "pt-BR": "Faça uma doação voluntária e contribua com o crescimento da The Black Lotus Assoc.",
            "en-US": "Make a voluntary donation and contribute to the growth of The Black Lotus Assoc.",
        }),
    async run({interaction}) {
        const embed = new EmbedBuilder()
            .setTitle(`Faça uma doação | The Black Lotus Assoc.`)
            .setDescription(
                `Ao fazer uma doação voluntária, você contribui diretamente para o *crescimento e desenvolvimento* da **The Black Lotus Assoc**. Suas doações nos permitem *continuar com nossa missão* de **impactar positivamente a comunidade do Discord**.\n\n**Com o seu apoio, podemos expandir nossas atividades, criar novas oportunidades e oferecer recursos que beneficiem ainda mais pessoas.** *Seu ato de generosidade é fundamental para que possamos alcançar nossos objetivos e fortalecer nossas iniciativas.*Juntos, podemos fazer uma diferença significativa e duradoura.\n\n*Faça parte dessa transformação, doe hoje e ajude-nos a continuar nossa jornada de crescimento e impacto positivo.*`
            )
            .setImage(
                "https://media.discordapp.net/attachments/1150106588758167694/1150174200812797962/bl.png?ex=666d5872&is=666c06f2&hm=287fba482e3f1fdc88019ea1550eda7947dc80ece5c6a0cf92e5d771545a023f&=&format=webp&quality=lossless&width=1440&height=512"
            )
            .setColor(0x404eed);

        const button = new ButtonBuilder()
            .setLabel("Donate")
            .setURL("https://ko-fi.com/plary")
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(button);

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false,
        });
    },
});
