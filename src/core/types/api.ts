export interface ILeaderboardNames {
    leaderboardNames: string[]
}

export interface ILeaderboardEntry {
    entryId: number
    rank: number
    playerName: string
    value: number
}

export interface ILeaderboardSnapshot {
    snapshotId: number
    leaderboardName: string
    fetchedAt: string
    entries: ILeaderboardEntry[]
}
