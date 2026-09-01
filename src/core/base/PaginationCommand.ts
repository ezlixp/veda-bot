import {
    ActionRowBuilder,
    BaseInteraction,
    ButtonBuilder,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} from "discord.js"
import {
    IPageSessionInfo,
    IPageTimeoutInfo,
    IPaginationContent,
} from "../types/paginationCommand.js"
import { Command } from "./Command.js"

export abstract class PaginationCommand extends Command {
    protected abstract readonly title: string
    protected readonly pageSize: number = 10
    protected readonly sessions: Map<string, IPageSessionInfo> = new Map()
    protected readonly timeouts: Map<string, IPageTimeoutInfo> = new Map()
    protected readonly currentPages: Map<string, number> = new Map()
    // need to create embed
    // need to create page part
    // need to expire

    protected async createEmbed(interaction: BaseInteraction): Promise<EmbedBuilder> {
        const content = await this.getPaginationContent(interaction)
        const description = this.getEmbedDescription(interaction, content)

        return new EmbedBuilder()
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.avatarURL() ?? interaction.user.defaultAvatarURL,
            })
            .setTitle(content.titleOverride ?? this.title)
            .setDescription(description)
            .setColor(Colors.Default)
            .setTimestamp(Date.now())
    }

    protected async calculateTotalPages(interaction: BaseInteraction): Promise<number> {
        const content = await this.getPaginationContent(interaction)
        return Math.ceil(content.entries.length / this.pageSize)
    }
    protected async createPaginationComponents(
        interaction: BaseInteraction,
    ): Promise<ActionRowBuilder<ButtonBuilder>> {
        const maxPages = await this.calculateTotalPages(interaction)
        const userId = interaction.user.id
        const currentPage = this.currentPages.get(userId) ?? -1
        const leaderboard = this.sessions.get(userId)?.options.getString("leaderboard") ?? ""

        const prevButton = new ButtonBuilder()
            .setLabel("\u25c4")
            .setCustomId(`prev:${leaderboard}`)
            .setStyle(ButtonStyle.Danger)
            .setDisabled(currentPage === 0)
        const pageSelector = new ButtonBuilder()
            .setLabel(`Page: ${currentPage}/${maxPages}`)
            .setCustomId("page_select")
            .setStyle(ButtonStyle.Danger)
        const nextButton = new ButtonBuilder()
            .setLabel("\u25ba")
            .setCustomId(`next:${leaderboard}`)
            .setStyle(ButtonStyle.Danger)
            .setDisabled(currentPage >= maxPages - 1)
        return new ActionRowBuilder<ButtonBuilder>().addComponents([
            prevButton,
            pageSelector,
            nextButton,
        ])
    }

    protected async createPageJumpModal(interaction: BaseInteraction) {
        const maxPages = await this.calculateTotalPages(interaction)
        const modal = new ModalBuilder().setCustomId("page_select_modal").setTitle("Jump to Page")

        const pageInput = new TextInputBuilder()
            .setCustomId("page_number_input")
            .setLabel(`Enter page number (1 - ${maxPages})`)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder("e.g. 3")
            .setMinLength(1)
            .setMaxLength(maxPages.toString().length)
            .setRequired(true)

        const modalRow = new ActionRowBuilder<TextInputBuilder>().addComponents(pageInput)
        modal.addComponents(modalRow)

        return modal
    }

    protected abstract getPaginationContent(
        interaction: BaseInteraction,
    ): Promise<IPaginationContent>

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected getEmbedDescription(interaction: BaseInteraction, content: IPaginationContent) {
        const page = 0
        content.entries.splice(0, page * this.pageSize)
        content.entries.splice(this.pageSize)
        return content.entries.map((e) => e.getRowString()).join("\n")
    }
    protected startOrResetTimeout(userId: string) {
        const timeoutInfo = this.timeouts.get(userId)!
        clearTimeout(timeoutInfo.timeoutToken)

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const cancelToken = setTimeout(async () => {
            await timeoutInfo.message.edit({ components: [] })
        }, 30000)

        timeoutInfo.timeoutToken = cancelToken
    }

    protected override async handle(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()
        this.sessions.set(interaction.user.id, { options: interaction.options })
        this.currentPages.set(interaction.user.id, 0)
        const message = await interaction.editReply({
            embeds: [await this.createEmbed(interaction)],
            components: [await this.createPaginationComponents(interaction)],
        })
        if (!this.timeouts.has("752610633580675176"))
            this.timeouts.set(interaction.user.id, { message: message })
        this.startOrResetTimeout("752610633580675176")
    }
}
