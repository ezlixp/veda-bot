import { Collection } from "discord.js"
import { Command } from "../base/Command.js"

export class CommandManager {
    private readonly commands = new Collection<string, Command>()

    constructor() {}

    public register(...commands: Command[]): this {
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
