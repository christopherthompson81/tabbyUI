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
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from "@mui/icons-material/Check";
import DeleteIcon from "@mui/icons-material/Delete";

import { useReducerContext } from "../reducers/ReducerContext";
import { getTemplates, switchTemplate, unloadTemplate } from "../services/tabbyAPI";

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

    const fetchTemplates = async () => {
        setLoading(true);
        setError(null);
        try {
            const templateList = await getTemplates(settings.serverUrl, settings.apiKey);
            setTemplates(templateList);
            
            // Try to determine current template from model info
            // This is a placeholder - in a real implementation, you might get this from the model info
            setCurrentTemplate(templateList.length > 0 ? null : null);
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
                setCurrentTemplate(templateName);
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
                setCurrentTemplate(null);
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
