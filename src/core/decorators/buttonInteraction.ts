export const BUTTON_INTERACTIONS = Symbol("buttons")

export interface IButtonInteractionExtension {
    [BUTTON_INTERACTIONS]?: Map<string, string>
}

export function buttonInteraction(regex: string) {
    return function (target: any, methodName: string) {
        const typed = target as IButtonInteractionExtension
        const interaction_map = (typed[BUTTON_INTERACTIONS] ??= new Map<string, string>())

        interaction_map.set(regex, methodName)
    }
}
