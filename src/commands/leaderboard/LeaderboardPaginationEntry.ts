import { PaginationEntry } from "../../core/entities/PaginationEntry.js"

export class LeaderboardPaginationEntry extends PaginationEntry {
    private readonly rank: number
    private readonly username: string
    private readonly value: number
    constructor(rank: number, username: string, value: number) {
        super()
        this.rank = rank
        this.username = username
        this.value = value
    }
    public override getRowString(): string {
        return `[${this.rank}.](https://veda-utils.vercel.app/players/${this.username}) ${this.username}: ${this.value}`
    }
}
