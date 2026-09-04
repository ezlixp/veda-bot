import { ILeaderboards, ILeaderboardSnapshot } from "../core/types/api.js"

const { BASE_URL } = process.env

export class ApiManager {
    private readonly baseUrl: string = BASE_URL!
    private readonly extra: string = "api/v1/"

    public async getLeaderboardNames(): Promise<ILeaderboards | null> {
        const res = await fetch(this.baseUrl + this.extra + "leaderboards")
        // trusting api
        if (res.ok) return (await res.json()) as ILeaderboards
        return null
    }

    public async getLeaderboardSnapshot(leaderboard: string): Promise<ILeaderboardSnapshot | null> {
        const res = await fetch(this.baseUrl + this.extra + "leaderboards/" + leaderboard)
        if (res.ok) return (await res.json()) as ILeaderboardSnapshot
        else return null
    }
}
