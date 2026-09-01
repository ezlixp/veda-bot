import { CommandInteractionOptionResolver, Message } from "discord.js"
import { PaginationEntry } from "../entities/PaginationEntry.js"

export interface IPageTimeoutInfo {
    message: Message
    timeoutToken?: NodeJS.Timeout
}
export interface IPageSessionInfo {
    options: Omit<CommandInteractionOptionResolver, "getMessage" | "getFocused">
}

export interface IEmbedContent {
    description: string
    count: number
}

export interface IPaginationContent {
    entries: PaginationEntry[]
    titleOverride?: string
}
