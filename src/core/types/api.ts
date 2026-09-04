export interface ILeaderboard {
    leaderboardId: string
    leaderboardName: string
    estimatedTimePerCompletionMinutes: number
}
export interface ILeaderboards {
    leaderboards: ILeaderboard[]
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
