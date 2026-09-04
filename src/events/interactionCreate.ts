import { BaseInteraction, ButtonInteraction, Events, ModalSubmitInteraction } from "discord.js"
import Event from "../core/templates/Event.js"
import Services from "../services/Services.js"
import {
    BUTTON_INTERACTIONS,
    IButtonInteractionExtension,
} from "../core/decorators/buttonInteraction.js"
import { Command } from "../core/base/Command.js"
import {
    IModalInteractionsExtension,
    MODAL_INTERACTIONS,
} from "../core/decorators/modalInteraction.js"

export default new Event({
    name: Events.InteractionCreate,
    async execute(interaction: BaseInteraction): Promise<void> {
        if (interaction.isChatInputCommand()) {
            if (!Services.Command.get(interaction.commandName)) return
            try {
                const command: Command = Services.Command.get(interaction.commandName)!

                if (!command.execute) {
                    console.error(`Failed to find execution handler for ${command.name}`)
                    await interaction.reply({
                        content: "There was an error while executing this command!",
                        ephemeral: true,
                    })
                    return
                }

                await command.execute(interaction)
            } catch (error) {
                console.error(error)
                try {
                    await interaction.reply({
                        content: "There was an error while executing this command!",
                        ephemeral: true,
                    })
                } catch (error) {
                    // cannot reply since the interaction was deferred, so follow up instead
                    // ephemeral won't work unless the deferral was ephemeral
                    await interaction.followUp({
                        content: "There was an error while executing this command!",
                        ephemeral: true,
                    })
                }
            }
        } else if (interaction.isAutocomplete()) {
            if (!Services.Command.get(interaction.commandName)) return

            try {
                const command: Command = Services.Command.get(interaction.commandName)!
                if (!command.autocomplete) {
                    console.error(`Failed to find autocomplete handler for ${command.name}`)
                    await interaction.respond([
                        {
                            name: "Failed to autocomplete",
                            value: "error",
                        },
                    ])
                    return
                }
                await command.autocomplete(interaction)
            } catch (error) {
                console.error(error)
            }
        } else if (interaction.isButton()) {
            try {
                const split = interaction.customId.split("$")
                const commandName = split[0]
                const id = split[1]
                const command: Command & IButtonInteractionExtension = Services.Command.get(
                    commandName,
                ) as Command & IButtonInteractionExtension
                const method = command[BUTTON_INTERACTIONS]!.get(id)
                const fn = command[method as keyof typeof command] as unknown as (
                    interaction: ButtonInteraction,
                ) => Promise<void>
                await fn.call(command, interaction)
            } catch (error) {
                console.error(error)
                try {
                    await interaction.reply({ content: "something went wrong", ephemeral: true })
                } catch (error) {
                    await interaction.followUp({ content: "something went wrong", ephemeral: true })
                }
            }
        } else if (interaction.isModalSubmit()) {
            try {
                const split = interaction.customId.split("$")
                const commandName = split[0]
                const id = split[1]
                const command: Command & IModalInteractionsExtension = Services.Command.get(
                    commandName,
                ) as Command & IModalInteractionsExtension
                const method = command[MODAL_INTERACTIONS]!.get(id)
                const fn = command[method as keyof typeof command] as unknown as (
                    interaction: ModalSubmitInteraction,
                ) => Promise<void>
                await fn.call(command, interaction)
            } catch (error) {
                console.error(error)
                try {
                    await interaction.reply({ content: "something went wrong", ephemeral: true })
                } catch (error) {
                    await interaction.followUp({ content: "something went wrong", ephemeral: true })
                }
            }
        }
    },
})
