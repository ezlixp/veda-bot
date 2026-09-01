import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    SlashCommandOptionsOnlyBuilder,
} from "discord.js"

export abstract class Command {
    public abstract readonly name: string
    public abstract readonly description: string

    public build(): SlashCommandOptionsOnlyBuilder {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
        return builder
    }

    public async autocomplete(interaction: AutocompleteInteraction): Promise<void> {
        await this.handleAutocomplete(interaction)
    }

    public async execute(interaction: ChatInputCommandInteraction): Promise<void> {
        await this.handle(interaction)
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async handle(interaction: ChatInputCommandInteraction) {}

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {}
}
