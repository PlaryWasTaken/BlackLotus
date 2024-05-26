import {AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {ExtendedClient} from "#/types";

type RunFunction = (args: {
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction
}) => unknown
type AutocompleteFunction = (args: {
    client: ExtendedClient,
    interaction: AutocompleteInteraction
}) => unknown
type AnySlashCommand =
    SlashCommandBuilder
    | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup">
    | Omit<SlashCommandBuilder, "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">;
export default class Command {
    public plugins?: {
        autocomplete?: string[],
        run?: string[]
    }
    private readonly data: AnySlashCommand
    private readonly global: boolean = false
    private readonly guilds: Array<string>
    private readonly runFunction: RunFunction
    private readonly autocompleteFunction?: AutocompleteFunction

    constructor(obj: {
        command: AnySlashCommand,
        global?: boolean,
        guilds?: Array<string>,
        run: RunFunction,
        autocomplete?: AutocompleteFunction,
        plugins?: {
            autocomplete?: string[],
            run?: string[]
        }
    }) {
        this.data = obj.command
        this.global = obj.global
        this.runFunction = obj.run
        this.autocompleteFunction = obj.autocomplete
        if (!obj.global) this.guilds = obj.guilds
        if (obj.plugins) this.plugins = obj.plugins
    }

    get name() {
        return this.data.name
    }

    get command() {
        return this.data
    }

    get isGlobal() {
        return this.global
    }

    get guildsWithCommand() {
        return this.guilds
    }

    get run() {
        return this.runFunction
    }

    get autocomplete() {
        return this.autocompleteFunction
    }

    async registerCommandForGuilds(client: ExtendedClient) {
        if (!this.guildsWithCommand) return
        for (const guild of this.guildsWithCommand) {
            const guildObj = client.guilds.cache.get(guild) ?? await client.guilds.fetch(guild)
            if (!guildObj) continue

            if (guildObj.commands.cache.has(this.data.name)) await guildObj.commands.edit(this.data.name, this.data)
            else await guildObj.commands.create(this.data)
        }
        return this
    }
}