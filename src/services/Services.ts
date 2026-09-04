import { ApiManager } from "./ApiManager.js"
import { CommandManager } from "./CommandManager.js"

export default abstract class Services {
    public static Command: CommandManager = new CommandManager()
    public static Api: ApiManager = new ApiManager()
}
