import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
    IconButton,
    CircularProgress,
    Alert,
    Divider,
    Box,
    Paper,
    TextField,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";

import { useReducerContext } from "../reducers/ReducerContext";
import { getTemplates, switchTemplate, unloadTemplate, getModelInfo, ModelInfo } from "../services/tabbyAPI";

interface TemplatesDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function TemplatesDialog({ open, onClose }: TemplatesDialogProps) {
    const { settings } = useReducerContext();
    const [templates, setTemplates] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [currentTemplate, setCurrentTemplate] = useState<string | null>(null);
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
    const [templateContent, setTemplateContent] = useState<string>("");

    const fetchModelInfo = async () => {
        try {
            const modelStatus = await getModelInfo(settings.serverUrl, settings.apiKey);
            setModelInfo(modelStatus.info);
            
            if (modelStatus.info?.parameters?.prompt_template) {
                setCurrentTemplate(modelStatus.info.parameters.prompt_template);
                setTemplateContent(modelStatus.info.parameters.prompt_template_content || "");
            } else {
                setCurrentTemplate(null);
                setTemplateContent("");
            }
        } catch (err) {
            console.error("Error fetching model info:", err);
        }
    };

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            await fetchModelInfo();
            const templateList = await getTemplates(settings.serverUrl, settings.apiKey);
            setTemplates(templateList);
        } catch (err) {
            setError("Failed to fetch templates");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSwitchTemplate = async (templateName: string) => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const result = await switchTemplate(
                settings.serverUrl,
                settings.adminApiKey,
                templateName
            );
            if (result) {
                setSuccess(`Switched to template: ${templateName}`);
                await fetchModelInfo(); // Refresh model info to get updated template content
            } else {
                setError("Failed to switch template");
            }
        } catch (err) {
            setError("Error switching template");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnloadTemplate = async () => {
        setLoading(true);
        setError(null);
        setSuccess(null);
        try {
            const result = await unloadTemplate(settings.serverUrl, settings.adminApiKey);
            if (result) {
                setSuccess("Template unloaded successfully");
                await fetchModelInfo(); // Refresh model info after unloading
            } else {
                setError("Failed to unload template");
            }
        } catch (err) {
            setError("Error unloading template");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchTemplates();
        }
    }, [open, settings.serverUrl, settings.apiKey]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                Templates
                <IconButton 
                    style={{ position: 'absolute', right: 8, top: 8 }}
                    onClick={fetchTemplates}
                    disabled={loading}
                >
                    <RefreshIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
                
                <Typography variant="subtitle1" gutterBottom>
                    Current Template: {currentTemplate || "None"}
                </Typography>
                
                {templateContent && (
                    <Box mb={3}>
                        <TextField
                            label="Template Content"
                            multiline
                            fullWidth
                            rows={6}
                            value={templateContent}
                            InputProps={{
                                readOnly: true,
                            }}
                            variant="outlined"
                            sx={{ mb: 2 }}
                        />
                    </Box>
                )}
                
                <Typography variant="subtitle1" gutterBottom>
                    Available Templates
                </Typography>
                
                {loading ? (
                    <Box display="flex" justifyContent="center" my={3}>
                        <CircularProgress />
                    </Box>
                ) : templates.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No templates available
                    </Typography>
                ) : (
                    <List>
                        {templates.map((template) => (
                            <ListItem key={template}>
                                <ListItemText 
                                    primary={template}
                                    secondary={currentTemplate === template ? "Currently active" : ""}
                                    primaryTypographyProps={{
                                        fontWeight: currentTemplate === template ? 'bold' : 'normal'
                                    }}
                                />
                                <ListItemSecondaryAction>
                                    <IconButton 
                                        edge="end" 
                                        onClick={() => handleSwitchTemplate(template)}
                                        disabled={currentTemplate === template}
                                    >
                                        <CheckIcon />
                                    </IconButton>
                                </ListItemSecondaryAction>
                            </ListItem>
                        ))}
                    </List>
                )}
                
                <Divider sx={{ my: 2 }} />
                
                <Box display="flex" justifyContent="flex-end">
                    <Button 
                        variant="outlined" 
                        color="warning" 
                        onClick={handleUnloadTemplate}
                        disabled={!currentTemplate || loading}
                        startIcon={<DeleteIcon />}
                    >
                        Unload Template
                    </Button>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
