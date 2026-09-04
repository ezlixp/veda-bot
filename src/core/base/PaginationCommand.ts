import {
    ActionRowBuilder,
    BaseInteraction,
    ButtonBuilder,
    ButtonInteraction,
    ButtonStyle,
    ChatInputCommandInteraction,
    Colors,
    EmbedBuilder,
    ModalBuilder,
    ModalSubmitInteraction,
    TextInputBuilder,
    TextInputModalData,
    TextInputStyle,
} from "discord.js"
import {
    IPageSessionInfo,
    IPageTimeoutInfo,
    IPaginationContent,
} from "../types/paginationCommand.js"
import { OptionsCommand } from "./OptionsCommand.js"
import { buttonInteraction } from "../decorators/buttonInteraction.js"
import { modalInteraction } from "../decorators/modalInteraction.js"

export abstract class PaginationCommand extends OptionsCommand {
    protected abstract readonly title: string
    protected readonly pageSize: number = 10
    protected readonly sessions: Map<string, IPageSessionInfo> = new Map()
    protected readonly timeouts: Map<string, IPageTimeoutInfo> = new Map()
    protected readonly currentPages: Map<string, number> = new Map()

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

        const prevButton = new ButtonBuilder()
            .setLabel("\u25c4")
            .setCustomId(`${this.name}$prev`)
            .setStyle(ButtonStyle.Danger)
            .setDisabled(currentPage === 0)
        const pageSelector = new ButtonBuilder()
            .setLabel(`Page: ${currentPage + 1}/${maxPages}`)
            .setCustomId(`${this.name}$page_select`)
            .setStyle(ButtonStyle.Danger)
        const nextButton = new ButtonBuilder()
            .setLabel("\u25ba")
            .setCustomId(`${this.name}$next`)
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
        const modal = new ModalBuilder()
            .setCustomId(`${this.name}$page_select_modal`)
            .setTitle("Jump to Page")

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

    protected getEmbedDescription(interaction: BaseInteraction, content: IPaginationContent) {
        const page = this.currentPages.get(interaction.user.id) || 0
        content.entries.splice(0, page * this.pageSize)
        content.entries.splice(this.pageSize)
        return content.entries.map((e) => e.getRowString()).join("\n")
    }
    protected stopTimeout(userId: string) {
        const timeoutInfo = this.timeouts.get(userId)!
        clearTimeout(timeoutInfo.timeoutToken)
    }
    protected startOrResetTimeout(userId: string) {
        const timeoutInfo = this.timeouts.get(userId)!
        this.stopTimeout(userId)

        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        const cancelToken = setTimeout(async () => {
            await timeoutInfo.message.edit({ components: [] })
            this.sessions.delete(userId)
            this.timeouts.delete(userId)
            this.currentPages.delete(userId)
        }, 30000)

        timeoutInfo.timeoutToken = cancelToken
    }

    protected override async handle(interaction: ChatInputCommandInteraction) {
        await interaction.deferReply()
        this.sessions.set(interaction.user.id, { options: interaction.options })
        this.currentPages.set(interaction.user.id, 0)
        const message = await interaction.followUp({
            embeds: [await this.createEmbed(interaction)],
            components: [await this.createPaginationComponents(interaction)],
        })
        await this.timeouts.get(interaction.user.id)?.message.edit({ components: [] })
        this.timeouts.set(interaction.user.id, { message: message })
        this.startOrResetTimeout(interaction.user.id)
    }

    @buttonInteraction("prev")
    protected async handlePrev(interaction: ButtonInteraction) {
        await interaction.deferUpdate()
        const userId = interaction.user.id
        const currentPage = this.currentPages.get(userId)!
        this.currentPages.set(userId, Math.max(currentPage - 1, 0))
        await interaction.message.edit({
            embeds: [await this.createEmbed(interaction)],
            components: [await this.createPaginationComponents(interaction)],
        })

        this.startOrResetTimeout(userId)
    }

    @buttonInteraction("page_select")
    protected async handlePageSelect(interaction: ButtonInteraction) {
        await interaction.showModal(await this.createPageJumpModal(interaction))

        this.stopTimeout(interaction.user.id)
    }

    @modalInteraction("page_select_modal")
    protected async handlePageSelectSubmit(interaction: ModalSubmitInteraction) {
        await interaction.deferUpdate()
        const userId = interaction.user.id
        const maxPage = (await this.calculateTotalPages(interaction)) - 1
        const page =
            parseInt(
                (interaction.fields.getField("page_number_input") as TextInputModalData).value,
            ) || 0
        this.currentPages.set(userId, Math.max(Math.min(page - 1, maxPage), 0))
        await interaction.message!.edit({
            embeds: [await this.createEmbed(interaction)],
            components: [await this.createPaginationComponents(interaction)],
        })

        this.startOrResetTimeout(userId)
    }

    @buttonInteraction("next")
    protected async handleNext(interaction: ButtonInteraction) {
        await interaction.deferUpdate()
        const userId = interaction.user.id
        const currentPage = this.currentPages.get(userId)!
        const maxPage = (await this.calculateTotalPages(interaction)) - 1
        this.currentPages.set(userId, Math.min(currentPage + 1, maxPage))
        await interaction.message.edit({
            embeds: [await this.createEmbed(interaction)],
            components: [await this.createPaginationComponents(interaction)],
        })

        this.startOrResetTimeout(userId)
    }
}
