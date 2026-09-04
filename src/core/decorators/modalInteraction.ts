export const MODAL_INTERACTIONS = Symbol("buttons")

export interface IModalInteractionsExtension {
    [MODAL_INTERACTIONS]?: Map<string, string>
}

export function modalInteraction(regex: string) {
    return function (target: any, methodName: string) {
        const typed = target as IModalInteractionsExtension
        const interaction_map = (typed[MODAL_INTERACTIONS] ??= new Map<string, string>())

        interaction_map.set(regex, methodName)
    }
}
