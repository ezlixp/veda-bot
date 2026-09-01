import {
    AutocompleteInteraction,
    ChatInputCommandInteraction,
    SlashCommandSubcommandBuilder,
} from "discord.js"

export abstract class SubCommand {
    public abstract readonly name: string
    public abstract readonly description: string

    public build(builder: SlashCommandSubcommandBuilder): SlashCommandSubcommandBuilder {
        return builder.setName(this.name).setDescription(this.description)
    }

    public abstract execute(interaction: ChatInputCommandInteraction): Promise<void>

    public async autocomplete?(interaction: AutocompleteInteraction): Promise<void>
}
