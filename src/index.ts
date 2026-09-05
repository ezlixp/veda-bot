/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import "dotenv/config"

import { Client, IntentsBitField, Partials } from "discord.js"
import { readdirSync } from "fs"
import type Event from "./core/templates/Event.js"
import deployGlobalCommands from "./deployGlobalCommands.js"
import Services from "./services/Services.js"
import { LeaderboardCommand } from "./commands/leaderboard/LeaderboardCommand.js"
import { PlayerSearchCommand } from "./commands/PlayerSearchCommand.js"
const { TOKEN } = process.env

Services.Command.register(new LeaderboardCommand(), new PlayerSearchCommand())

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
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        client.once(event.name, (...args) => event.execute(...args))
    } else {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        client.on(event.name, (...args) => event.execute(...args))
    }
}

await client.login(TOKEN)
