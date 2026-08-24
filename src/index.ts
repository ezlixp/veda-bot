/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import "dotenv/config"

import { Client, IntentsBitField, Partials } from "discord.js"
import { readdirSync } from "fs"
import type Event from "./templates/Event.js"
import deployGlobalCommands from "./deployGlobalCommands.js"
const { TOKEN } = process.env

await deployGlobalCommands()

// Discord client object
global.client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.DirectMessages,
        IntentsBitField.Flags.MessageContent,
    ],
    partials: [Partials.Channel],
})

// Event handling
const eventFiles: string[] = readdirSync("./events").filter(
    (file) => file.endsWith(".js") || file.endsWith(".ts"),
)

for (const file of eventFiles) {
    const event: Event = (await import(`./events/${file}`)).default as Event
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        client.on(event.name, (...args) => event.execute(...args))
    }
}

await client.login(TOKEN)
