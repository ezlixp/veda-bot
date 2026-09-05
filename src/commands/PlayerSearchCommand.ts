import {
    ActionRowBuilder,
    AttachmentBuilder,
    AutocompleteInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    SlashCommandOptionsOnlyBuilder,
} from "discord.js"
import { OptionsCommand } from "../core/base/OptionsCommand.js"
import Services from "../services/Services.js"
import satori from "satori"
import { Resvg } from "@resvg/resvg-js"

export class PlayerSearchCommand extends OptionsCommand {
    private static REFRESH_MILLIS: number = 3600000 // 1 hour
    public name: string = "player"
    public description: string = "View stats of a player"

    private choices: string[] = []
    private refreshedAt: number = 0

    public override build(): SlashCommandOptionsOnlyBuilder {
        return super
            .build()
            .addStringOption((option) =>
                option
                    .setName("player")
                    .setDescription("The player to view")
                    .setAutocomplete(true)
                    .setRequired(true)
                    .setMinLength(1)
                    .setMaxLength(16),
            )
    }

    public override async handleAutocomplete(interaction: AutocompleteInteraction): Promise<void> {
        const player = interaction.options.getString("player") || ""
        if (Date.now() - this.refreshedAt > PlayerSearchCommand.REFRESH_MILLIS) {
            const players = await Services.Api.getPlayers()
            if (players) {
                this.choices = players
                this.refreshedAt = Date.now()
            }
        }
        const out = this.choices
            .filter((o) => o.toLowerCase().startsWith(player.toLowerCase()))
            .map((c) => ({ name: c, value: c }))
        out.splice(25)

        await interaction.respond(out)
    }

    private createLinkButton(username: string): ActionRowBuilder<ButtonBuilder> {
        return new ActionRowBuilder<ButtonBuilder>().addComponents([
            new ButtonBuilder()
                .setStyle(ButtonStyle.Link)
                .setLabel("View full profile")
                .setURL(`https://veda-utils.vercel.app/players/${username}`),
        ])
    }

    private createStatCard(label: string, value: string) {
        return {
            type: "div",
            props: {
                style: {
                    display: "flex",
                    flexDirection: "column",
                    justify: "center",
                    alignItems: "center",
                    backgroundColor: "rgba(31, 31, 31, 0.75)",
                    border: "2px solid rgba(60, 60, 56, 0.5)",
                    borderRadius: 4,
                    width: 330,
                    padding: "16px 12px",
                },
                children: [
                    {
                        type: "span",
                        props: {
                            style: {
                                color: "#8c8c8a",
                                fontSize: 33,
                                fontWeight: 500,
                                marginTop: 10,
                                textAlign: "center",
                            },
                            children: label,
                        },
                    },
                    {
                        type: "span",
                        props: {
                            style: {
                                color: "#ffffff",
                                fontSize: 48,
                                fontWeight: 600,
                                marginTop: 8,
                                marginBottom: 10,
                                textAlign: "center",
                            },
                            children: value,
                        },
                    },
                ],
            },
        }
    }

    public override async handle(interaction: ChatInputCommandInteraction): Promise<void> {
        await interaction.deferReply()
        const username = interaction.options.getString("player")
        if (!username) {
            throw new Error("missing parameter")
        }
        const stats = await Services.Api.getPlayer(username)
        if (!stats) {
            throw new Error("could not find player")
        }
        const formattedUsername = stats.username
        const weight = stats.weight
        const completions = stats.totalCompletions
        const playtime = stats.totalPlaytimeMinutes
        const mostPlayed = stats.entries.sort(
            (a, b) => b.estimatedPlaytimeMinutes - a.estimatedPlaytimeMinutes,
        )[0]

        const fontData = await fetch(
            "https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-400-normal.woff",
        ).then((res) => res.arrayBuffer())

        // const imagePath = path.resolve("./assets/card_background.png")
        // const imageBuffer = await fs.readFile(imagePath)

        // const background = `data:image/png;base64,${imageBuffer.toString("base64")}`

        const svg = await satori(
            {
                type: "div",
                props: {
                    style: {
                        display: "flex",
                        width: "100%",
                        height: "100%",
                        position: "relative",
                        fontFamily: "Roboto",
                    },
                    children: [
                        {
                            type: "img",
                            props: {
                                src: "https://cdn.discordapp.com/attachments/1320612881670340628/1545620786616729701/2024-04-27_17.06.351.png?ex=6a9ccf07&is=6a9b7d87&hm=3ea0f23fba4d9d7943f0466e3dabd15717e29936f0c15605d3be1eda760352db&",
                                alt: "Background",
                                style: {
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    right: 0,
                                    bottom: 0,
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                },
                            },
                        },
                        {
                            type: "div",
                            props: {
                                style: {
                                    position: "relative",
                                    display: "flex",
                                    flexDirection: "column",
                                    width: "100%",
                                    height: "100%",
                                    backgroundColor: "rgba(15, 15, 15, 0.6)",
                                },
                                children: [
                                    {
                                        type: "div",
                                        props: {
                                            style: {
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                backgroundColor: "rgba(15, 15, 15, 0.6)",
                                                color: "#ffffff",
                                                fontSize: 35,
                                                fontWeight: 500,
                                                padding: "12px 0",
                                            },
                                            children: "Veda Overview",
                                        },
                                    },
                                    {
                                        type: "div",
                                        props: {
                                            style: {
                                                display: "flex",
                                                flex: 1,
                                                width: "100%",
                                            },
                                            children: [
                                                {
                                                    type: "div",
                                                    props: {
                                                        style: {
                                                            width: "30%",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            gap: 12,
                                                        },
                                                        children: [
                                                            {
                                                                type: "div",
                                                                props: {
                                                                    style: {
                                                                        color: "#ffffff",
                                                                        fontSize: 50,
                                                                        fontWeight: 500,
                                                                    },
                                                                    children: formattedUsername,
                                                                },
                                                            },
                                                            {
                                                                type: "img",
                                                                props: {
                                                                    src: `https://mc-heads.net/body/${username}`,
                                                                    alt: "Minecraft Skin",
                                                                    style: {
                                                                        height: 350,
                                                                        objectFit: "contain",
                                                                    },
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                                {
                                                    type: "div",
                                                    props: {
                                                        style: {
                                                            width: "70%",
                                                            display: "flex",
                                                            flexDirection: "column",
                                                            alignItems: "center",
                                                            justifyContent: "center",
                                                            gap: 75,
                                                        },
                                                        children: [
                                                            {
                                                                type: "div",
                                                                props: {
                                                                    style: {
                                                                        display: "flex",
                                                                        gap: 75,
                                                                    },
                                                                    children: [
                                                                        this.createStatCard(
                                                                            "Weight",
                                                                            "" + weight,
                                                                        ),
                                                                        this.createStatCard(
                                                                            "Total Completions",
                                                                            "" + completions,
                                                                        ),
                                                                    ],
                                                                },
                                                            },
                                                            {
                                                                type: "div",
                                                                props: {
                                                                    style: {
                                                                        display: "flex",
                                                                        gap: 75,
                                                                    },
                                                                    children: [
                                                                        this.createStatCard(
                                                                            "Estimated Playtime",
                                                                            playtime + " minutes",
                                                                        ),
                                                                        this.createStatCard(
                                                                            "Most Played",
                                                                            mostPlayed.leaderboardName,
                                                                        ),
                                                                    ],
                                                                },
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    ],
                },
            },
            {
                width: 1200,
                height: 675,
                fonts: [
                    {
                        name: "Roboto",
                        data: fontData,
                        weight: 400,
                        style: "normal",
                    },
                ],
            },
        )
        const attachment = new AttachmentBuilder(new Resvg(svg).render().asPng(), {
            name: "stats.png",
        })
        await interaction.followUp({
            files: [attachment],
            components: [this.createLinkButton(username)],
        })
    }
}
