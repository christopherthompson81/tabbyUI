import { ChangeEvent, useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    MenuItem,
    IconButton,
    InputAdornment,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { GenerationParams } from "../reducers/settingsReducer";

interface SettingsDialogProps {
    open: boolean;
    onClose: () => void;
    serverUrl: string;
    onServerUrlChange: (e: ChangeEvent<HTMLInputElement>) => void;
    apiKey: string;
    onApiKeyChange: (e: ChangeEvent<HTMLInputElement>) => void;
    adminApiKey: string;
    onAdminApiKeyChange: (e: ChangeEvent<HTMLInputElement>) => void;
    generationParams: GenerationParams;
    onGenerationParamsChange: (
        key: keyof GenerationParams,
        value: string
    ) => void;
}

function SettingsDialog({
    open,
    onClose,
    serverUrl,
    onServerUrlChange,
    apiKey,
    onApiKeyChange,
    adminApiKey,
    onAdminApiKeyChange,
    generationParams,
    onGenerationParamsChange,
}: SettingsDialogProps) {
    const handleParamChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        param: any
    ) => {
        const value = e.target.value;
        if (param.type === "number" && isNaN(Number(value))) return;
        onGenerationParamsChange(param.key as keyof GenerationParams, value);
    };

    const generationParamLabels = [
        { label: "Max Tokens", key: "maxTokens", type: "number" },
        { label: "Temperature", key: "temperature", type: "number" },
        { label: "Top P", key: "topP", type: "number" },
        { label: "Top K", key: "topK", type: "number" },
        { label: "Frequency Penalty", key: "frequencyPenalty", type: "number" },
        { label: "Presence Penalty", key: "presencePenalty", type: "number" },
        {
            label: "Repetition Penalty",
            key: "repetitionPenalty",
            type: "number",
        },
        { label: "Typical P", key: "typicalP", type: "number" },
    ];
    const advancedParamLabels1 = [
        { label: "Min Tokens", key: "minTokens", type: "number" },
        { label: "Generate Window", key: "generateWindow", type: "number" },
        { label: "Mirostat Mode", key: "mirostatMode", type: "number" },
        { label: "Mirostat Tau", key: "mirostatTau", type: "number" },
        { label: "Mirostat Eta", key: "mirostatEta", type: "number" },
    ];
    const advancedParamLabels2 = [
        {
            label: "Token Healing",
            key: "tokenHealing",
            options: ["true", "false"],
        },
        {
            label: "Add BOS Token",
            key: "addBosToken",
            options: ["true", "false"],
        },
        {
            label: "Ban EOS Token",
            key: "banEosToken",
            options: ["true", "false"],
        },
    ];
    const [showApiKey, setShowApiKey] = useState(false);
    const [showAdminApiKey, setShowAdminApiKey] = useState(false);
    const [maskedApiKey, setMaskedApiKey] = useState("");
    const [maskedAdminApiKey, setMaskedAdminApiKey] = useState("");

    useEffect(() => {
        setMaskedApiKey(apiKey ? "•".repeat(apiKey.length) : "");
        setMaskedAdminApiKey(adminApiKey ? "•".repeat(adminApiKey.length) : "");
    }, [apiKey, adminApiKey]);

    const handleClose = () => {
        if (!apiKey) return;
        setShowApiKey(false);
        setShowAdminApiKey(false);
        onClose();
    };

    const handleSave = () => {
        if (!apiKey) return;
        setShowApiKey(false);
        setShowAdminApiKey(false);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Settings</DialogTitle>
            <DialogContent>
                {!apiKey && (
                    <Typography color="error" sx={{ mb: 2, color: "red" }}>
                        API Key is required
                    </Typography>
                )}
                <TextField
                    label="Server URL"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={serverUrl}
                    onChange={onServerUrlChange}
                />
                <TextField
                    label="API Key"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type={showApiKey ? "text" : "password"}
                    value={showApiKey ? apiKey : maskedApiKey}
                    onChange={onApiKeyChange}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle api key visibility"
                                    onClick={() => setShowApiKey(!showApiKey)}
                                    edge="end"
                                >
                                    {showApiKey ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
                <TextField
                    label="Admin API Key"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    type={showAdminApiKey ? "text" : "password"}
                    value={showAdminApiKey ? adminApiKey : maskedAdminApiKey}
                    onChange={onAdminApiKeyChange}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    aria-label="toggle admin api key visibility"
                                    onClick={() =>
                                        setShowAdminApiKey(!showAdminApiKey)
                                    }
                                    edge="end"
                                >
                                    {showAdminApiKey ? (
                                        <VisibilityOff />
                                    ) : (
                                        <Visibility />
                                    )}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />

                <Typography variant="h6" sx={{ mt: 2 }}>
                    Generation Parameters
                </Typography>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 2,
                    }}
                >
                    {generationParamLabels.map((param) => (
                        <TextField
                            key={param.key}
                            label={param.label}
                            type={param.type}
                            variant="outlined"
                            value={
                                generationParams[
                                    param.key as keyof GenerationParams
                                ]
                            }
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => handleParamChange(e, param)}
                        />
                    ))}
                </Box>

                <Typography variant="h6" sx={{ mt: 2 }}>
                    Advanced Parameters
                </Typography>
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: "repeat(2, 1fr)",
                        gap: 2,
                    }}
                >
                    {advancedParamLabels1.map((param) => (
                        <TextField
                            key={param.key}
                            label={param.label}
                            type={param.type}
                            variant="outlined"
                            value={
                                generationParams[
                                    param.key as keyof GenerationParams
                                ]
                            }
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => handleParamChange(e, param)}
                        />
                    ))}

                    {advancedParamLabels2.map((param) => (
                        <TextField
                            key={param.key}
                            label={param.label}
                            select
                            variant="outlined"
                            value={
                                generationParams[
                                    param.key as keyof GenerationParams
                                ]
                            }
                            onChange={(
                                e: React.ChangeEvent<HTMLInputElement>
                            ) => handleParamChange(e, param)}
                        >
                            {param.options.map((option) => (
                                <MenuItem key={option} value={option}>
                                    {option}
                                </MenuItem>
                            ))}
                        </TextField>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSave} disabled={!apiKey}>
                    Save Settings
                </Button>
                <Button onClick={handleClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

export default SettingsDialog;
