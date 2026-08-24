import { BaseInteraction, Events } from "discord.js"
import Event from "../templates/Event.js"
import Services from "../services/Services.js"
import { Command } from "../base/Command.js"

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
                await interaction.reply({
                    content: "There was an error while executing this command!",
                    ephemeral: true,
                })
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
        }
    },
})
