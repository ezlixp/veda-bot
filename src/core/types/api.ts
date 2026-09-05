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

export interface IPlayerLeaderboardEntry {
    leaderboardName: string
    rank: number
    value: number
    estimatedPlaytimeMinutes: number
}

export interface ILeaderboardSnapshot {
    snapshotId: number
    leaderboardName: string
    fetchedAt: string
    entries: ILeaderboardEntry[]
}

export interface IPlayerSnapshot {
    username: string
    weight: number
    totalCompletions: number
    totalPlaytimeMinutes: number
    entries: IPlayerLeaderboardEntry[]
}
