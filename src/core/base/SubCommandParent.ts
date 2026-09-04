import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    Collection,
    SlashCommandBuilder,
    SlashCommandSubcommandsOnlyBuilder,
} from "discord.js"
import { SubCommand } from "./SubCommand.js"
import { Command } from "./Command.js"

export abstract class SubCommandParent extends Command {
    public abstract readonly name: string
    public abstract readonly description: string
    protected subcommands = new Collection<string, SubCommand>()

    public registerSubcommand(sub: SubCommand) {
        this.subcommands.set(sub.name, sub)
    }

    public build(): SlashCommandSubcommandsOnlyBuilder {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
        for (const sub of this.subcommands.values()) {
            builder.addSubcommand((subBuilder) => sub.build(subBuilder))
        }
        return builder
    }

    public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const subName = interaction.options.getSubcommand(false)
        if (subName) {
            const subcommand = this.subcommands.get(subName)
            if (subcommand?.autocomplete) {
                await subcommand.autocomplete(interaction)
            }
            return
        }
        await this.handleAutocomplete(interaction)
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        const subName = interaction.options.getSubcommand(false)
        if (subName) {
            const sub = this.subcommands.get(subName)
            if (sub) {
                await sub.execute(interaction)
                return
            }
        }
        // should not reach here
        await this.handle(interaction)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async handle(interaction: ChatInputCommandInteraction) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {}
}
