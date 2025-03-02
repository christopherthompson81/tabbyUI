import React, { useState, useEffect } from "react";
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
    Divider,
    TextField,
    Slider,
    IconButton,
    Box,
    Paper,
    Grid,
    Chip,
    CircularProgress,
    Alert,
    Snackbar,
    FormControlLabel,
    Checkbox,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useReducerContext } from "../reducers/ReducerContext";
import {
    LoRA,
    getAllLoRAs,
    getActiveLoRAs,
    loadLoRAs,
    unloadAllLoRAs,
} from "../services/tabbyAPI";

interface LoRAsDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function LoRAsDialog({ open, onClose }: LoRAsDialogProps) {
    const { settings } = useReducerContext();
    const [availableLoRAs, setAvailableLoRAs] = useState<LoRA[]>([]);
    const [activeLoRAs, setActiveLoRAs] = useState<LoRA[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedLoRAs, setSelectedLoRAs] = useState<{
        [key: string]: { name: string; scaling: number };
    }>({});
    const [skipQueue, setSkipQueue] = useState(false);
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");

    const fetchLoRAs = async () => {
        setLoading(true);
        setError(null);
        try {
            const [allLoRAs, active] = await Promise.all([
                getAllLoRAs(settings.serverUrl, settings.apiKey),
                getActiveLoRAs(settings.serverUrl, settings.apiKey),
            ]);
            setAvailableLoRAs(allLoRAs);
            setActiveLoRAs(active);
        } catch (err) {
            setError("Failed to fetch LoRAs");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) {
            fetchLoRAs();
        }
    }, [open, settings.serverUrl, settings.apiKey]);

    const handleSelectLoRA = (lora: LoRA) => {
        setSelectedLoRAs((prev) => {
            const newSelected = { ...prev };
            if (newSelected[lora.id]) {
                delete newSelected[lora.id];
            } else {
                newSelected[lora.id] = {
                    name: lora.id,
                    scaling: lora.scaling || 1.0,
                };
            }
            return newSelected;
        });
    };

    const handleScalingChange = (id: string, value: number) => {
        setSelectedLoRAs((prev) => ({
            ...prev,
            [id]: { ...prev[id], scaling: value },
        }));
    };

    const handleLoadLoRAs = async () => {
        setLoading(true);
        setError(null);
        try {
            const loras = Object.values(selectedLoRAs);
            if (loras.length === 0) {
                setError("No LoRAs selected");
                setLoading(false);
                return;
            }

            const success = await loadLoRAs(
                settings.serverUrl,
                settings.adminApiKey,
                {
                    loras,
                    skip_queue: skipQueue,
                }
            );

            if (success) {
                setSnackbarMessage("LoRAs loaded successfully");
                setSnackbarOpen(true);
                fetchLoRAs();
                setSelectedLoRAs({});
            } else {
                setError("Failed to load LoRAs");
            }
        } catch (err) {
            setError("Error loading LoRAs");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUnloadAllLoRAs = async () => {
        setLoading(true);
        setError(null);
        try {
            const success = await unloadAllLoRAs(
                settings.serverUrl,
                settings.adminApiKey
            );

            if (success) {
                setSnackbarMessage("All LoRAs unloaded successfully");
                setSnackbarOpen(true);
                fetchLoRAs();
            } else {
                setError("Failed to unload LoRAs");
            }
        } catch (err) {
            setError("Error unloading LoRAs");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const isLoRAActive = (id: string) => {
        return activeLoRAs.some((lora) => lora.id === id);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">LoRA Management</Typography>
                    <IconButton onClick={fetchLoRAs} disabled={loading}>
                        <RefreshIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            Available LoRAs
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 1, height: 300, overflow: 'auto' }}>
                            {loading ? (
                                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                                    <CircularProgress />
                                </Box>
                            ) : availableLoRAs.length === 0 ? (
                                <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                                    No LoRAs available
                                </Typography>
                            ) : (
                                <List dense>
                                    {availableLoRAs.map((lora) => (
                                        <React.Fragment key={lora.id}>
                                            <ListItem
                                                button
                                                onClick={() => handleSelectLoRA(lora)}
                                                selected={!!selectedLoRAs[lora.id]}
                                                secondaryAction={
                                                    isLoRAActive(lora.id) && (
                                                        <Chip 
                                                            size="small" 
                                                            color="primary" 
                                                            label={`Active (${activeLoRAs.find(l => l.id === lora.id)?.scaling || 1.0})`} 
                                                        />
                                                    )
                                                }
                                            >
                                                <ListItemText 
                                                    primary={lora.id} 
                                                    secondary={`Owner: ${lora.owned_by}`} 
                                                />
                                            </ListItem>
                                            <Divider component="li" />
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Paper>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle1" gutterBottom>
                            Selected LoRAs
                        </Typography>
                        <Paper variant="outlined" sx={{ p: 1, height: 300, overflow: 'auto' }}>
                            {Object.keys(selectedLoRAs).length === 0 ? (
                                <Typography variant="body2" color="textSecondary" sx={{ p: 2 }}>
                                    No LoRAs selected
                                </Typography>
                            ) : (
                                <List dense>
                                    {Object.entries(selectedLoRAs).map(([id, { scaling }]) => (
                                        <React.Fragment key={id}>
                                            <ListItem>
                                                <ListItemText 
                                                    primary={id} 
                                                    secondary={
                                                        <Box sx={{ width: '100%' }}>
                                                            <Typography id={`scaling-slider-${id}`} gutterBottom>
                                                                Scaling: {scaling}
                                                            </Typography>
                                                            <Slider
                                                                value={scaling}
                                                                onChange={(_, value) => handleScalingChange(id, value as number)}
                                                                step={0.1}
                                                                min={0}
                                                                max={2}
                                                                valueLabelDisplay="auto"
                                                                aria-labelledby={`scaling-slider-${id}`}
                                                            />
                                                        </Box>
                                                    }
                                                />
                                                <IconButton 
                                                    edge="end" 
                                                    aria-label="delete" 
                                                    onClick={() => handleSelectLoRA({ id, object: '', created: 0, owned_by: '', scaling })}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </ListItem>
                                            <Divider component="li" />
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Paper>
                        
                        <Box sx={{ mt: 2 }}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={skipQueue}
                                        onChange={(e) => setSkipQueue(e.target.checked)}
                                    />
                                }
                                label="Skip Queue"
                            />
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button 
                    onClick={handleUnloadAllLoRAs} 
                    color="error" 
                    disabled={loading || activeLoRAs.length === 0}
                >
                    Unload All
                </Button>
                <Button 
                    onClick={handleLoadLoRAs} 
                    color="primary" 
                    disabled={loading || Object.keys(selectedLoRAs).length === 0}
                    variant="contained"
                >
                    Load Selected
                </Button>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
            
            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={() => setSnackbarOpen(false)}
                message={snackbarMessage}
            />
        </Dialog>
    );
}
