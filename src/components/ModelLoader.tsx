import { useState } from "react";
import { ModelLoadProgress, loadModelWithProgress } from "../services/tabbyAPI";
import {
    ModelLoadParams,
    getModelParams,
    persistModelParams,
} from "../utils/persistence";
import ProgressDialog from "./ProgressDialog";
import { Typography } from "@mui/material";

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
    const [modelParams, setModelParams] = useState(() =>
        getModelParams(selectedModel)
    );

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

    const handleParamChange = (field: string, value: any) => {
        setModelParams((prev) => {
            const newParams = {
                ...prev,
                [field]: value,
            };
            if (selectedModel) {
                persistModelParams(selectedModel, newParams);
            }
            return newParams;
        });
    };

    const loadModel = async (modelId: string, draftModelId?: string, customParams?: Partial<ModelLoadParams>) => {
        try {
            const payload: ModelLoadParams = {
                ...modelParams,
                ...customParams,
                model_name: modelId,
                gpu_split: modelParams.gpu_split_auto
                    ? null
                    : modelParams.gpu_split,
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
