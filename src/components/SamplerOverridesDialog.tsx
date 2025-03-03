import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    FormControl,
    FormHelperText,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Paper,
    Checkbox,
    Slider,
    TextField,
    CircularProgress,
    Alert
} from "@mui/material";
import { useReducerContext } from "../reducers/ReducerContext";
import {
    getSamplerOverrides,
    switchSamplerOverride,
    unloadSamplerOverride,
    SamplerOverrides,
    SamplerOverride
} from "../services/tabbyAPI";

interface SamplerOverridesDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function SamplerOverridesDialog({ open, onClose }: SamplerOverridesDialogProps) {
    const { settings } = useReducerContext();
    const [loading, setLoading] = useState(false);
    const [selectedPreset, setSelectedPreset] = useState<string>("");
    const [presets, setPresets] = useState<string[]>([]);
    const [overrides, setOverrides] = useState<SamplerOverrides>({});
    const [error, setError] = useState<string | null>(null);

    // Parameters that can be overridden
    const availableParams = [
        { key: "temperature", label: "Temperature", min: 0, max: 2, step: 0.01 },
        { key: "top_p", label: "Top P", min: 0, max: 1, step: 0.01 },
        { key: "top_k", label: "Top K", min: 0, max: 100, step: 1 },
        { key: "repetition_penalty", label: "Repetition Penalty", min: 1, max: 2, step: 0.01 },
        { key: "presence_penalty", label: "Presence Penalty", min: 0, max: 2, step: 0.01 },
        { key: "frequency_penalty", label: "Frequency Penalty", min: 0, max: 2, step: 0.01 }
    ];

    useEffect(() => {
        if (open) {
            loadSamplerOverrides();
        }
    }, [open, settings.serverUrl, settings.apiKey]);

    const loadSamplerOverrides = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getSamplerOverrides(settings.serverUrl, settings.apiKey);
            setSelectedPreset(data.selected_preset);
            setPresets(data.presets);
            setOverrides(data.overrides);
        } catch (err) {
            setError("Failed to load sampler overrides");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handlePresetChange = async (preset: string) => {
        setLoading(true);
        setError(null);
        try {
            const success = await switchSamplerOverride(
                settings.serverUrl,
                settings.adminApiKey,
                { preset }
            );
            if (success) {
                setSelectedPreset(preset);
                await loadSamplerOverrides();
            } else {
                setError("Failed to switch preset");
            }
        } catch (err) {
            setError("Failed to switch preset");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleOverrideChange = (param: string, field: keyof SamplerOverride, value: any) => {
        setOverrides(prev => {
            const newOverrides = { ...prev };
            if (!newOverrides[param]) {
                newOverrides[param] = { force: false, override: 0 };
            }
            newOverrides[param] = { ...newOverrides[param], [field]: value };
            return newOverrides;
        });
    };

    const handleApplyOverrides = async () => {
        setLoading(true);
        setError(null);
        try {
            const success = await switchSamplerOverride(
                settings.serverUrl,
                settings.adminApiKey,
                { overrides }
            );
            if (success) {
                await loadSamplerOverrides();
            } else {
                setError("Failed to apply overrides");
            }
        } catch (err) {
            setError("Failed to apply overrides");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnloadOverrides = async () => {
        setLoading(true);
        setError(null);
        try {
            const success = await unloadSamplerOverride(
                settings.serverUrl,
                settings.adminApiKey
            );
            if (success) {
                await loadSamplerOverrides();
            } else {
                setError("Failed to unload overrides");
            }
        } catch (err) {
            setError("Failed to unload overrides");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Sampler Overrides</DialogTitle>
            <DialogContent>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Alert severity="error" sx={{ my: 2 }}>{error}</Alert>
                ) : (
                    <>
                        <Box sx={{ mb: 3, mt: 1 }}>
                            <FormControl fullWidth>
                                <InputLabel>Preset</InputLabel>
                                <Select
                                    value={selectedPreset}
                                    onChange={(e) => handlePresetChange(e.target.value)}
                                    label="Preset"
                                >
                                    {presets.map((preset) => (
                                        <MenuItem key={preset} value={preset}>
                                            {preset}
                                        </MenuItem>
                                    ))}
                                </Select>
                                <FormHelperText>
                                    Select a preset to apply predefined sampler settings
                                </FormHelperText>
                            </FormControl>
                        </Box>

                        <Typography variant="h6" gutterBottom>
                            Custom Overrides
                        </Typography>
                        
                        <Grid container spacing={2}>
                            {availableParams.map((param) => (
                                <Grid item xs={12} key={param.key}>
                                    <Paper sx={{ p: 2 }}>
                                        <Grid container spacing={2} alignItems="center">
                                            <Grid item xs={3}>
                                                <Typography variant="body1">{param.label}</Typography>
                                            </Grid>
                                            <Grid item xs={1}>
                                                <Checkbox
                                                    checked={Boolean(overrides[param.key]?.force)}
                                                    onChange={(e) => 
                                                        handleOverrideChange(param.key, 'force', e.target.checked)
                                                    }
                                                />
                                            </Grid>
                                            <Grid item xs={2}>
                                                <Typography variant="body2">
                                                    {overrides[param.key]?.force ? "Force" : "Override"}
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={4}>
                                                <Slider
                                                    value={overrides[param.key]?.override || 0}
                                                    min={param.min}
                                                    max={param.max}
                                                    step={param.step}
                                                    onChange={(_, value) => 
                                                        handleOverrideChange(param.key, 'override', value as number)
                                                    }
                                                    disabled={!overrides[param.key]}
                                                    valueLabelDisplay="auto"
                                                />
                                            </Grid>
                                            <Grid item xs={2}>
                                                <TextField
                                                    type="number"
                                                    value={overrides[param.key]?.override || 0}
                                                    onChange={(e) => 
                                                        handleOverrideChange(
                                                            param.key, 
                                                            'override', 
                                                            parseFloat(e.target.value)
                                                        )
                                                    }
                                                    disabled={!overrides[param.key]}
                                                    inputProps={{
                                                        min: param.min,
                                                        max: param.max,
                                                        step: param.step
                                                    }}
                                                    size="small"
                                                />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            ))}
                        </Grid>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={handleUnloadOverrides} color="secondary">
                    Unload Overrides
                </Button>
                <Button onClick={handleApplyOverrides} color="primary" variant="contained">
                    Apply Overrides
                </Button>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
