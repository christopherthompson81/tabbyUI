import { GenerationParams } from "../components/SettingsDialog";

export interface SettingsState {
    serverUrl: string;
    apiKey: string;
    adminApiKey: string;
    generationParams: GenerationParams;
}

export type SettingsAction =
    | { type: 'SET_SERVER_URL'; url: string }
    | { type: 'SET_API_KEY'; key: string }
    | { type: 'SET_ADMIN_API_KEY'; key: string }
    | { type: 'SET_GENERATION_PARAM'; key: keyof GenerationParams; value: string };

export function settingsReducer(state: SettingsState, action: SettingsAction): SettingsState {
    switch (action.type) {
        case 'SET_SERVER_URL':
            return { ...state, serverUrl: action.url };
        case 'SET_API_KEY':
            return { ...state, apiKey: action.key };
        case 'SET_ADMIN_API_KEY':
            return { ...state, adminApiKey: action.key };
        case 'SET_GENERATION_PARAM':
            return {
                ...state,
                generationParams: {
                    ...state.generationParams,
                    [action.key]: action.value
                }
            };
        default:
            return state;
    }
}
