import { useState, useEffect } from "react";
import { Typography } from "@mui/material";

// Local Imports
import { useReducerContext } from "../reducers/ReducerContext";
import { ModelLoadProgress, loadModelWithProgress } from "../services/tabbyAPI";
import {
    ModelLoadParams,
    getModelParams,
    persistModelParams,
} from "../utils/persistence";
//components
import ProgressDialog from "./ProgressDialog";

interface ModelInfo {
    id: string;
    object: string;
    created: number;
    owned_by: string;
}

interface ModelLoaderProps {
    serverUrl: string;
    adminApiKey: string;
    onLoadComplete?: () => void;
}

export function useModelLoader({
    serverUrl,
    adminApiKey,
    onLoadComplete,
}: ModelLoaderProps) {
    const [models, setModels] = useState<ModelInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedModel, setSelectedModel] = useState("");
    const [selectedDraftModel, setSelectedDraftModel] = useState("");
    const [loadingProgress, setLoadingProgress] =
        useState<ModelLoadProgress | null>(null);

    const fetchModels = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${serverUrl}/v1/models`, {
                headers: {
                    "x-api-key": adminApiKey,
                },
            });
            if (!response.ok) throw new Error("Failed to fetch models");
            const data = await response.json();
            setModels(data.data);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch models"
            );
        } finally {
            setLoading(false);
        }
    };

    const { modelParams, dispatch } = useReducerContext();

    useEffect(() => {
        if (selectedModel) {
            const params = getModelParams(selectedModel);
            dispatch({
                type: "SET_MODEL_PARAMS",
                modelId: selectedModel,
                params,
            });
        }
    }, [selectedModel]);

    const handleParamChange = (field: string, value: any) => {
        if (selectedModel) {
            dispatch({
                type: "SET_MODEL_PARAMS",
                modelId: selectedModel,
                params: { [field]: value },
            });
            persistModelParams(selectedModel, {
                ...modelParams[selectedModel],
                [field]: value,
            });
        }
    };

    const loadModel = async (
        modelId: string,
        draftModelId?: string,
        customParams?: Partial<ModelLoadParams>
    ) => {
        try {
            const payload: ModelLoadParams = {
                ...modelParams[modelId],
                ...customParams,
                model_name: modelId,
                gpu_split: modelParams[modelId].gpu_split_auto
                    ? []
                    : modelParams[modelId].gpu_split,
            };

            if (draftModelId) {
                payload.draft_model = {
                    draft_model_name: draftModelId,
                    draft_rope_scale: 0,
                    draft_rope_alpha: 1,
                    draft_cache_mode: "FP16",
                };
            }

            setLoadingProgress(null);

            await loadModelWithProgress(
                serverUrl,
                adminApiKey,
                payload,
                (progress) => {
                    setLoadingProgress(progress);
                }
            );

            await fetchModels();
            onLoadComplete?.();
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load model"
            );
        } finally {
            setLoadingProgress(null);
        }
    };

    return {
        models,
        loading,
        error,
        selectedModel,
        setSelectedModel,
        selectedDraftModel,
        setSelectedDraftModel,
        modelParams,
        handleParamChange,
        loadModel,
        loadingProgress,
        fetchModels,
    };
}

export function ModelLoaderForm({
    error,
    loadingProgress,
}: ReturnType<typeof useModelLoader>) {
    return (
        <>
            {error && <Typography color="error">{error}</Typography>}

            <ProgressDialog
                open={!!loadingProgress}
                progress={loadingProgress}
            />
        </>
    );
}
