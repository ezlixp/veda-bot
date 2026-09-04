import { SlashCommandBuilder, SlashCommandOptionsOnlyBuilder } from "discord.js"
import { Command } from "./Command.js"

export abstract class OptionsCommand extends Command {
    public override build(): SlashCommandOptionsOnlyBuilder {
        const builder = new SlashCommandBuilder()
            .setName(this.name)
            .setDescription(this.description)
        return builder
    }
}
