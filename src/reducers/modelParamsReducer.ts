import { DraftModelParams, ModelLoadParams } from "../utils/persistence";

export interface ModelParamsState {
    [modelId: string]: ModelLoadParams;
}

export type ModelParamsAction =
    | { type: 'SET_MODEL_PARAMS'; modelId: string; params: Partial<ModelLoadParams> }
    | { type: 'UPDATE_DRAFT_MODEL'; modelId: string; draftParams: DraftModelParams | null }
    | { type: 'TOGGLE_GPU_SPLIT_AUTO'; modelId: string }
    | { type: 'SET_GPU_SPLIT'; modelId: string; split: number[] | null };

export function modelParamsReducer(state: ModelParamsState, action: ModelParamsAction): ModelParamsState {
    switch (action.type) {
        case 'SET_MODEL_PARAMS':
            return {
                ...state,
                [action.modelId]: {
                    ...state[action.modelId],
                    ...action.params
                }
            };
        case 'UPDATE_DRAFT_MODEL':
            return {
                ...state,
                [action.modelId]: {
                    ...state[action.modelId],
                    draft_model: action.draftParams
                }
            };
        case 'TOGGLE_GPU_SPLIT_AUTO':
            return {
                ...state,
                [action.modelId]: {
                    ...state[action.modelId],
                    gpu_split_auto: !state[action.modelId]?.gpu_split_auto
                }
            };
        case 'SET_GPU_SPLIT':
            return {
                ...state,
                [action.modelId]: {
                    ...state[action.modelId],
                    gpu_split: action.split
                }
            };
        default:
            return state;
    }
}
