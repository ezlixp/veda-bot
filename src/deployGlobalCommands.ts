/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { REST } from "@discordjs/rest"
import { RESTPostAPIApplicationCommandsJSONBody, Routes } from "discord.js"
import Services from "./services/Services.js"
const { TOKEN, CLIENT_ID, DEFAULT_GUILD_ID } = process.env

export default async function deployGlobalCommands() {
    const commands: RESTPostAPIApplicationCommandsJSONBody[] = Services.Command.toJSON()

    const rest = new REST({ version: "10" }).setToken(TOKEN as string)

    try {
        console.log("Started refreshing application (/) commands.")

        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID as string, DEFAULT_GUILD_ID as string),
            {
                body: commands,
            },
        )

        console.log("Successfully reloaded application (/) commands.")
    } catch (error) {
        console.error(error)
    }
}
