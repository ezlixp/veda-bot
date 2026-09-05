import { ILeaderboards, ILeaderboardSnapshot, IPlayerSnapshot } from "../core/types/api.js"

const { BASE_URL } = process.env

export class ApiManager {
    private readonly baseUrl: string = BASE_URL!
    private readonly extra: string = "api/v1/"

    private async get(path: string): Promise<Response> {
        const res = await fetch(this.baseUrl + this.extra + path)
        return res
    }
    public async getLeaderboardNames(): Promise<ILeaderboards | null> {
        const res = await this.get("leaderboards")
        // trusting api
        if (res.ok) return (await res.json()) as ILeaderboards
        return null
    }

    public async getLeaderboardSnapshot(leaderboard: string): Promise<ILeaderboardSnapshot | null> {
        const res = await this.get(`leaderboards/${leaderboard}`)
        if (res.ok) return (await res.json()) as ILeaderboardSnapshot
        else return null
    }

    public async getPlayers(): Promise<string[] | null> {
        const res = await this.get("players")
        if (res.ok) return ((await res.json()) as { players: string[] }).players
        else return null
    }

    public async getPlayer(player: string): Promise<IPlayerSnapshot | null> {
        const res = await this.get(`players/${player}`)
        if (res.ok) return (await res.json()) as IPlayerSnapshot
        else return null
    }
}
