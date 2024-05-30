import {ColorResolvable, EmbedBuilder} from "discord.js";

import Event from "#structs/Event";
function randomColor() {
    let color = '#';
    for (let i = 0; i < 6; i++){
        const random = Math.random();
        const bit = (random * 16) | 0;
        color += (bit).toString(16);
    }
    return color;
}


export default new Event().setData("button.acceptServer", async (client, interaction, args) => {
    const guild = client.guilds.cache.get(args[0])
    const inviteCode = args[1]
    const embed = new EmbedBuilder(interaction.message.embeds[0].data).setColor('#00ff00')
    await interaction.reply({content: 'Adicionando...', ephemeral: true, fetchReply: true})
    const blackLotus = client.guilds.cache.get('896047806454837278')
    const member = await blackLotus.members.fetch(args[2]).catch(() => {
    })
    if (!member) return interaction.editReply({ content: `O membro representante não está no servidor!` })
    if (guild.memberCount < 2900) {
        const server = await client.syndicateManager.create({ // Try to create a new server in the database, fails if the server is already in the database
            id: guild.id,
            repId: args[2],
            invite: inviteCode
        }).catch(() => {
        })
        if (!server) {
            const embed = new EmbedBuilder()
            embed.setTitle('Servidor já existe')
            embed.setColor('#ff0000')
            return interaction.editReply({embeds: [embed]})
        }
        await member.roles.add("897108319175581746")
        await member.send(`Olá, ${member.user.tag}! Seu servidor agora faz parte da Black Syndicate!\nEm até 2 horas deve ver seu servidor aparecendo na embed`).catch(() => {
        })
        await interaction.editReply({
            content: `Adicionado com sucesso`
        }).catch(async () => {
            await interaction.channel.send({
                content: `Discord ta sendo esquisito e a interacão foi droppada, mas o servidor foi adicionado`
            })
        })
        client.emit('syndicate.serverAccept', server.id)
        await interaction.message.edit({embeds: [embed], components: []})
        return
    }
    const server = await client.blackLotusManager.create({ // Try to create a new server in the database, fails if the server is already in the database
        id: guild.id,
        repId: args[2],
        invite: inviteCode
    }).catch(() => {
    })
    if (!server) {
        const embed = new EmbedBuilder()
        embed.setTitle('Servidor já existe')
        embed.setColor('#ff0000')
        return interaction.followUp({embeds: [embed]})
    }
    const constelation = await server.constelation.fetch()
    const constelationRole = await blackLotus.roles.fetch(constelation.roleId).catch(() => {
    })
    if (!constelationRole) {
        await server.delete().catch(() => {
        })
        return interaction.followUp({content: 'Não foi possível encontrar o cargo de constelacão'})
    }

    const newRole = await blackLotus.roles.create({
        name: guild.name,
        reason: `Criando cargo de guilda aceita`,
        permissions: 0n,
        position: constelationRole.position - 1,
        color: randomColor() as ColorResolvable
    })
    await member.roles.add([newRole, constelationRole.id, "897108319175581746"])
    server.data.modules.blackLotus.role = newRole.id
    await server.data.save()
    await member.send(`Olá, ${member.user.tag}! Seu servidor agora faz parte da Black 蓮!\nEm até 2 horas deve ver seu servidor aparecendo na embed`).catch(() => {
    })
    await interaction.followUp({
        ephemeral: true,
        content: `Criei o cargo com sucesso e adicionei na embed ${guild.name.length < 25 ? '' : '(Note que o servidor não aparecerá na embed por ter um nome acima de 25 caracteres)'}`
    }).catch(async () => {
        await interaction.channel.send({
            content: `Discord ta sendo esquisito e a interacão foi droppada, mas o servidor foi adicionado`
        })
    })
    client.emit('blacklotus.serverAccept', server.id)
    await interaction.message.edit({embeds: [embed], components: []})
    // Setting up the guild commands
    /*
    const commands = getCommandsFromFolder('./slash_commands/guild')
    console.log(commands)
    for (let command of commands) {
        await guild.commands.create(command)
    }
    console.log(`Guild ${guild.name} (${guild.id}) was added to the database and the guild commands were set up`)
     */


})