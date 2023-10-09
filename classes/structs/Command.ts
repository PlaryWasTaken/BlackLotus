import {AutocompleteInteraction, ChatInputCommandInteraction, SlashCommandBuilder} from "discord.js";
import {ExtendedClient} from "../../types";

type RunFunction = (args: {
    client: ExtendedClient,
    interaction: ChatInputCommandInteraction
}) => unknown
type AutocompleteFunction = (args: {
    client: ExtendedClient,
    interaction: AutocompleteInteraction
}) => unknown
// Discord.js is truly a strange piece of software sometimes
type AnySlashCommand = SlashCommandBuilder | Omit<SlashCommandBuilder, "addSubcommand" | "addSubcommandGroup"> | Omit<SlashCommandBuilder, "addBooleanOption" | "addUserOption" | "addChannelOption" | "addRoleOption" | "addAttachmentOption" | "addMentionableOption" | "addStringOption" | "addIntegerOption" | "addNumberOption">;
export default class Command {
    private readonly data: AnySlashCommand
    private readonly global: boolean = false
    private readonly guilds: Array<string>
    private readonly runFunction: RunFunction
    private readonly autocompleteFunction?: AutocompleteFunction
    public plugins?: {
        autocomplete?: string[],
        run?: string[]
    }
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
        if (!global) this.guilds = obj.guilds
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
}