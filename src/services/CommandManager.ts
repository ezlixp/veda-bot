import { Collection } from "discord.js"
import { OptionsCommand } from "../core/base/OptionsCommand.js"
import { Command } from "../core/base/Command.js"

export class CommandManager {
    private readonly commands = new Collection<string, Command>()

    constructor() {}

    public register(...commands: OptionsCommand[]): this {
        for (const cmd of commands) {
            this.commands.set(cmd.name, cmd)
        }
        return this
    }

    public get(name: string): Command | undefined {
        return this.commands.get(name)
    }

    public toJSON() {
        return this.commands.map((cmd) => cmd.build().toJSON())
    }
}
