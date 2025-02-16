import { useEffect, useState } from "react";
import { useReducerContext } from "../reducers/ReducerContext";
import {
    Checkbox,  
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Box,
    InputLabel,
    FormControl,
    FormControlLabel,
    MenuItem,
    Select,
    //SelectChangeEvent,
    TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import ProgressDialog from './ProgressDialog';
import { useModelLoader } from "./ModelLoader";
import {
    getModelParams,
    persistModelParams,
    getAllModelParams,
} from "../utils/persistence";
import { ModelInfo, getModelInfo } from "../services/tabbyAPI";
import { Typography } from "@mui/material";

interface ModelPreferences {
    [taskType: string]: string;
}

interface ModelsDialogProps {
    open: boolean;
    onClose: () => void;
    serverUrl: string;
    adminApiKey: string;
}

function getInitialModel() {
    const data = Object.keys(getAllModelParams());
    const sortedModels = [...data].sort((a, b) => a.localeCompare(b));
    return sortedModels[0];
}

function ModelsDialog({
    open,
    onClose,
    serverUrl,
    adminApiKey,
}: ModelsDialogProps) {
    const { modelParams, dispatch } = useReducerContext();
    
    const modelLoader = useModelLoader({
        serverUrl,
        adminApiKey,
        onLoadComplete: () => {},
    });
    const [models, setModels] = useState<ModelInfo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedModel, setSelectedModel] = useState(getInitialModel());
    const [selectedDraftModel, setSelectedDraftModel] = useState("");
    const [preferences, setPreferences] = useState<ModelPreferences>(() => {
        const saved = localStorage.getItem("modelPreferences");
        return saved ? JSON.parse(saved) : {};
    });

    useEffect(() => {
        if (open) {
            fetchModels();
        }
    }, [open]);

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
            const sortedModels = [...data.data].sort((a, b) => a.id.localeCompare(b.id));
            setModels(sortedModels);
            if (!selectedModel) {
                setSelectedModel(sortedModels[0]);
            }
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch models"
            );
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        if (selectedModel) {
            const params = getModelParams(selectedModel);
            dispatch({ type: 'SET_MODEL_PARAMS', modelId: selectedModel, params });
        }
    }, [selectedModel]);

    const handleParamChange = (field: string, value: any) => {
        if (selectedModel) {
            dispatch({
                type: 'SET_MODEL_PARAMS',
                modelId: selectedModel,
                params: { [field]: value }
            });
            persistModelParams(selectedModel, {
                ...modelParams[selectedModel],
                [field]: value
            });
        }
    };

    const savePreferences = (newPreferences: ModelPreferences) => {
        setPreferences(newPreferences);
        localStorage.setItem(
            "modelPreferences",
            JSON.stringify(newPreferences)
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Model Management</DialogTitle>
            <DialogContent>
                {error && <Typography color="error">{error}</Typography>}

                <Box sx={{ mt: 2 }}>
                    <Typography variant="h6">Available Models</Typography>
                    {loading ? (
                        <Typography>Loading models...</Typography>
                    ) : (
                        <FormControl fullWidth sx={{ mt: 2 }}>
                            <InputLabel>Select Model</InputLabel>
                            <Select
                                value={selectedModel}
                                onChange={(e) => {
                                    const modelId = e.target.value as string;
                                    setSelectedModel(modelId);
                                }}
                                label="Select Model"
                            >
                                {models.map((model) => (
                                    <MenuItem key={model.id} value={model.id}>
                                        {model.id}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    )}
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="Max Sequence Length"
                                type="number"
                                value={modelParams[selectedModel]?.max_seq_len}
                                onChange={(e) =>
                                    handleParamChange(
                                        "max_seq_len",
                                        parseInt(e.target.value)
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="Cache Size"
                                type="number"
                                value={modelParams[selectedModel]?.cache_size}
                                onChange={(e) =>
                                    handleParamChange(
                                        "cache_size",
                                        parseInt(e.target.value)
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={Boolean(modelParams[selectedModel]?.tensor_parallel)}
                                        onChange={(e) =>
                                            handleParamChange(
                                                "tensor_parallel",
                                                e.target.checked
                                            )
                                        }
                                    />
                                }
                                label="Tensor Parallel"
                            />
                        </Grid>
                        <Grid size={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={Boolean(modelParams[selectedModel]?.gpu_split_auto)}
                                        onChange={(e) =>
                                            handleParamChange(
                                                "gpu_split_auto",
                                                e.target.checked
                                            )
                                        }
                                    />
                                }
                                label="GPU Split Auto"
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="Rope Scale"
                                type="number"
                                value={modelParams[selectedModel]?.rope_scale}
                                onChange={(e) =>
                                    handleParamChange(
                                        "rope_scale",
                                        parseFloat(e.target.value)
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="Rope Alpha"
                                type="number"
                                value={modelParams[selectedModel]?.rope_alpha}
                                onChange={(e) =>
                                    handleParamChange(
                                        "rope_alpha",
                                        parseFloat(e.target.value)
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={6}>
                            <FormControl fullWidth>
                                <InputLabel>Cache Mode</InputLabel>
                                <Select
                                    value={modelParams[selectedModel]?.cache_mode}
                                    label="Cache Mode"
                                    onChange={(e) =>
                                        handleParamChange(
                                            "cache_mode",
                                            e.target.value
                                        )
                                    }
                                >
                                    <MenuItem value="FP16">FP16</MenuItem>
                                    <MenuItem value="Q8">Q8</MenuItem>
                                    <MenuItem value="Q6">Q6</MenuItem>
                                    <MenuItem value="Q4">Q4</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="GPU Split"
                                value={
                                    modelParams[selectedModel]?.gpu_split
                                        ? modelParams[selectedModel]?.gpu_split.join(",")
                                        : ""
                                }
                                onChange={(e) =>
                                    handleParamChange(
                                        "gpu_split",
                                        e.target.value
                                            ? e.target.value
                                                  .split(",")
                                                  .map(Number)
                                            : null
                                    )
                                }
                                disabled={Boolean(modelParams[selectedModel]?.gpu_split_auto)}
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="Chunk Size"
                                type="number"
                                value={modelParams[selectedModel]?.chunk_size}
                                onChange={(e) =>
                                    handleParamChange(
                                        "chunk_size",
                                        parseInt(e.target.value)
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="Prompt Template"
                                value={modelParams[selectedModel]?.prompt_template}
                                onChange={(e) =>
                                    handleParamChange(
                                        "prompt_template",
                                        e.target.value
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={Boolean(modelParams[selectedModel]?.vision)}
                                        onChange={(e) =>
                                            handleParamChange(
                                                "vision",
                                                e.target.checked
                                            )
                                        }
                                    />
                                }
                                label="Vision"
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="Num Experts Per Token"
                                type="number"
                                value={modelParams[selectedModel]?.num_experts_per_token}
                                onChange={(e) =>
                                    handleParamChange(
                                        "num_experts_per_token",
                                        parseInt(e.target.value)
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={6}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={Boolean(modelParams[selectedModel]?.skip_queue)}
                                        onChange={(e) =>
                                            handleParamChange(
                                                "skip_queue",
                                                e.target.checked
                                            )
                                        }
                                    />
                                }
                                label="Skip Queue"
                            />
                        </Grid>
                        <Grid size={6}>
                            <TextField
                                fullWidth
                                label="Autosplit Reserve"
                                value={
                                    modelParams[selectedModel]?.autosplit_reserve
                                        ? modelParams[selectedModel]?.autosplit_reserve.join(
                                              ","
                                          )
                                        : ""
                                }
                                onChange={(e) =>
                                    handleParamChange(
                                        "autosplit_reserve",
                                        e.target.value
                                            ? e.target.value
                                                  .split(",")
                                                  .map(Number)
                                            : []
                                    )
                                }
                            />
                        </Grid>
                        <Grid size={12}>
                            <FormControl fullWidth>
                                <InputLabel>
                                    Select Draft Model (Optional)
                                </InputLabel>
                                <Select
                                    value={selectedDraftModel}
                                    onChange={(e) => {
                                        setSelectedDraftModel(
                                            e.target.value as string
                                        );
                                        handleParamChange(
                                            "draft_model",
                                            e.target.value
                                                ? {
                                                      draft_model_name:
                                                          e.target.value,
                                                      draft_rope_scale:
                                                          modelParams[selectedModel]
                                                              ?.draft_model
                                                              ?.draft_rope_scale ||
                                                          0,
                                                      draft_rope_alpha:
                                                          modelParams[selectedModel]
                                                              ?.draft_model
                                                              ?.draft_rope_alpha ||
                                                          1,
                                                      draft_cache_mode:
                                                          modelParams[selectedModel]
                                                              ?.draft_model
                                                              ?.draft_cache_mode ||
                                                          "FP16",
                                                  }
                                                : null
                                        );
                                    }}
                                    label="Select Draft Model"
                                >
                                    <MenuItem value="">None</MenuItem>
                                    {models.map((model) => (
                                        <MenuItem
                                            key={model.id}
                                            value={model.id}
                                        >
                                            {model.id}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        {selectedDraftModel && (
                            <>
                                <Grid size={4}>
                                    <TextField
                                        fullWidth
                                        label="Draft Rope Scale"
                                        type="number"
                                        value={
                                            modelParams[selectedModel]?.draft_model
                                                ?.draft_rope_scale || 0
                                        }
                                        onChange={(e) =>
                                            handleParamChange("draft_model", {
                                                ...modelParams[selectedModel]?.draft_model,
                                                draft_rope_scale: parseFloat(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                    />
                                </Grid>
                                <Grid size={4}>
                                    <TextField
                                        fullWidth
                                        label="Draft Rope Alpha"
                                        type="number"
                                        value={
                                            modelParams[selectedModel]?.draft_model
                                                ?.draft_rope_alpha || 1
                                        }
                                        onChange={(e) =>
                                            handleParamChange("draft_model", {
                                                ...modelParams[selectedModel]?.draft_model,
                                                draft_rope_alpha: parseFloat(
                                                    e.target.value
                                                ),
                                            })
                                        }
                                    />
                                </Grid>
                                <Grid size={4}>
                                    <FormControl fullWidth>
                                        <InputLabel>Draft Cache Mode</InputLabel>
                                        <Select
                                            value={
                                                modelParams[selectedModel]?.draft_model
                                                    ?.draft_cache_mode || "FP16"
                                            }
                                            label="Draft Cache Mode"
                                            onChange={(e) =>
                                                handleParamChange("draft_model", {
                                                    ...modelParams[selectedModel]?.draft_model,
                                                    draft_cache_mode:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <MenuItem value="FP16">FP16</MenuItem>
                                            <MenuItem value="Q8">Q8</MenuItem>
                                            <MenuItem value="Q6">Q6</MenuItem>
                                            <MenuItem value="Q4">Q4</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </>
                        )}
                        <Grid size={12}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={() =>
                                    selectedModel &&
                                    modelLoader.loadModel(selectedModel, selectedDraftModel, modelParams[selectedModel])
                                }
                                disabled={!selectedModel}
                            >
                                Load Selected Model{" "}
                                {selectedDraftModel && `with Draft Model`}
                            </Button>
                        </Grid>
                    </Grid>
                </Box>

                <Box sx={{ mt: 4 }}>
                    <Typography variant="h6">Model Preferences</Typography>
                    {["Vision", "Chain-of-Thought", "Coding", "Assistant"].map(
                        (taskType) => (
                            <Box key={taskType} sx={{ mt: 2 }}>
                                <FormControl fullWidth>
                                    <InputLabel>{taskType} Model</InputLabel>
                                    <Select
                                        value={preferences[taskType] || ""}
                                        onChange={(e) =>
                                            savePreferences({
                                                ...preferences,
                                                [taskType]: e.target.value,
                                            })
                                        }
                                        label={`${taskType} Model`}
                                    >
                                        <MenuItem value="">Default</MenuItem>
                                        {models.map((model) => (
                                            <MenuItem
                                                key={model.id}
                                                value={model.id}
                                            >
                                                {model.id}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        )
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>

            <ProgressDialog
                open={!!modelLoader.loadingProgress}
                progress={modelLoader.loadingProgress}
            />
        </Dialog>
    );
}

export default ModelsDialog;
