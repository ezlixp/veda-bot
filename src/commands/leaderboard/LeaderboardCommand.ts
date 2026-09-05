import {
    AutocompleteInteraction,
    BaseInteraction,
    EmbedBuilder,
    SlashCommandOptionsOnlyBuilder,
} from "discord.js"
import { PaginationCommand } from "../../core/base/PaginationCommand.js"
import Services from "../../services/Services.js"
import { IPaginationContent } from "../../core/types/pagination.js"
import { LeaderboardPaginationEntry } from "./LeaderboardPaginationEntry.js"

export class LeaderboardCommand extends PaginationCommand {
    protected title: string = "Leaderboard"
    public readonly name = "leaderboard"
    public readonly description = "view a leaderboard"

    private choices: string[] = []
    private refreshedAt: number = 0

    public override build(): SlashCommandOptionsOnlyBuilder {
        return super
            .build()
            .addStringOption((option) =>
                option
                    .setName("leaderboard")
                    .setDescription("Which leaderboard to view?")
                    .setRequired(true)
                    .setAutocomplete(true),
            )
    }

    protected override async createEmbed(interaction: BaseInteraction): Promise<EmbedBuilder> {
        return (await super.createEmbed(interaction)).setURL(
            `https://veda-utils.vercel.app/leaderboards?name=${encodeURIComponent(this.sessions.get(interaction.user.id)?.options.getString("leaderboard") || "")}`,
        )
    }

    protected async getPaginationContent(
        interaction: BaseInteraction,
    ): Promise<IPaginationContent> {
        const leaderboard = this.sessions.get(interaction.user.id)?.options.getString("leaderboard")
        if (!leaderboard) {
            throw new Error("missing parameter")
        }
        const snapshots = await Services.Api.getLeaderboardSnapshot(leaderboard)
        if (!snapshots) {
            throw new Error("could not get snapshot")
        }
        const entries = snapshots.entries.map(
            (e) => new LeaderboardPaginationEntry(e.rank, e.playerName, e.value),
        )
        return { entries: entries, titleOverride: snapshots.leaderboardName }
    }
    protected override async handleAutocomplete(
        interaction: AutocompleteInteraction,
    ): Promise<void> {
        const leaderboard = interaction.options.getString("leaderboard")
        if (!this.choices || Date.now() - this.refreshedAt > 600000) {
            const options = await Services.Api.getLeaderboardNames()
            if (options) {
                this.choices = options.leaderboards.map((l) => l.leaderboardName)
                this.refreshedAt = Date.now()
            }
        }
        await interaction.respond(
            this.choices
                .filter((c) => c.toLowerCase().startsWith(leaderboard?.toLowerCase() ?? ""))
                .map((c) => ({ name: c, value: c })),
        )
    }
}
