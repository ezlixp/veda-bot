import { CommandManager } from "./CommandManager.js"

export default abstract class Services {
    public static Command: CommandManager = new CommandManager()
}
