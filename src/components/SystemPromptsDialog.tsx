import { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    List,
    ListItem,
    ListItemText,
    IconButton,
    Box,
    Typography,
    Divider,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";

interface SystemPrompt {
    id: string;
    name: string;
    content: string;
}

interface SystemPromptsDialogProps {
    open: boolean;
    onClose: () => void;
}

const STORAGE_KEY = "systemPrompts";

// Helper function to get the active system prompt
export function getActiveSystemPrompt(): string {
    const activePromptId = localStorage.getItem("activeSystemPromptId") || "default";
    const systemPrompts = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    const activePrompt = systemPrompts.find((p: any) => p.id === activePromptId);
    return activePrompt?.content || "You are a helpful, harmless, and honest AI assistant.";
}

export default function SystemPromptsDialog({ open, onClose }: SystemPromptsDialogProps) {
    const [systemPrompts, setSystemPrompts] = useState<SystemPrompt[]>([]);
    const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<boolean>(false);
    const [editName, setEditName] = useState<string>("");
    const [editContent, setEditContent] = useState<string>("");
    const [activePromptId, setActivePromptId] = useState<string | null>(null);

    // Load system prompts from localStorage
    useEffect(() => {
        const savedPrompts = localStorage.getItem(STORAGE_KEY);
        if (savedPrompts) {
            setSystemPrompts(JSON.parse(savedPrompts));
        } else {
            // Initialize with a default system prompt
            const defaultPrompts: SystemPrompt[] = [
                {
                    id: "default",
                    name: "Default System Prompt",
                    content: "You are a helpful, harmless, and honest AI assistant."
                }
            ];
            setSystemPrompts(defaultPrompts);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPrompts));
        }

        // Load active prompt
        const activeId = localStorage.getItem("activeSystemPromptId");
        if (activeId) {
            setActivePromptId(activeId);
        } else {
            // Set default as active if no active prompt is set
            setActivePromptId("default");
            localStorage.setItem("activeSystemPromptId", "default");
        }
    }, []);

    // Save system prompts to localStorage whenever they change
    useEffect(() => {
        if (systemPrompts.length > 0) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(systemPrompts));
        }
    }, [systemPrompts]);

    const handleSelectPrompt = (id: string) => {
        setSelectedPromptId(id);
        setEditMode(false);
    };

    const handleEditPrompt = () => {
        if (!selectedPromptId) return;
        
        const prompt = systemPrompts.find(p => p.id === selectedPromptId);
        if (prompt) {
            setEditName(prompt.name);
            setEditContent(prompt.content);
            setEditMode(true);
        }
    };

    const handleSavePrompt = () => {
        if (editMode && selectedPromptId) {
            // Update existing prompt
            setSystemPrompts(prevPrompts => 
                prevPrompts.map(p => 
                    p.id === selectedPromptId 
                        ? { ...p, name: editName, content: editContent } 
                        : p
                )
            );
        } else {
            // Create new prompt
            const newPrompt: SystemPrompt = {
                id: Date.now().toString(),
                name: editName,
                content: editContent
            };
            setSystemPrompts(prevPrompts => [...prevPrompts, newPrompt]);
            setSelectedPromptId(newPrompt.id);
        }
        setEditMode(false);
    };

    const handleDeletePrompt = () => {
        if (!selectedPromptId) return;
        
        // Don't allow deleting the active prompt
        if (selectedPromptId === activePromptId) {
            alert("Cannot delete the active system prompt.");
            return;
        }

        setSystemPrompts(prevPrompts => 
            prevPrompts.filter(p => p.id !== selectedPromptId)
        );
        setSelectedPromptId(null);
        setEditMode(false);
    };

    const handleNewPrompt = () => {
        setEditName("");
        setEditContent("");
        setSelectedPromptId(null);
        setEditMode(true);
    };

    const handleSetActive = () => {
        if (!selectedPromptId) return;
        
        setActivePromptId(selectedPromptId);
        localStorage.setItem("activeSystemPromptId", selectedPromptId);
    };

    const selectedPrompt = selectedPromptId 
        ? systemPrompts.find(p => p.id === selectedPromptId) 
        : null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>System Prompts</DialogTitle>
            <DialogContent>
                <Box sx={{ display: "flex", height: "500px" }}>
                    {/* Left side - Prompt list */}
                    <Box sx={{ width: "30%", borderRight: 1, borderColor: "divider", pr: 1 }}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                            <Typography variant="subtitle1">Available Prompts</Typography>
                            <IconButton onClick={handleNewPrompt} size="small" color="primary">
                                <AddIcon />
                            </IconButton>
                        </Box>
                        <List sx={{ overflow: "auto", maxHeight: "450px" }}>
                            {systemPrompts.map((prompt) => (
                                // @ts-ignore or @ts-expect-error
                                <ListItem
                                    key={prompt.id}
                                    selected={selectedPromptId === prompt.id}
                                    onClick={() => handleSelectPrompt(prompt.id)}
                                    secondaryAction={
                                        prompt.id === activePromptId && (
                                            <Typography variant="caption" color="primary">Active</Typography>
                                        )
                                    }
                                    sx={{ 
                                        cursor: "pointer",
                                        bgcolor: prompt.id === activePromptId ? "rgba(25, 118, 210, 0.08)" : "transparent"
                                    }}
                                >
                                    <ListItemText primary={prompt.name} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                    {/* Right side - Prompt editor */}
                    <Box sx={{ width: "70%", pl: 2 }}>
                        {editMode ? (
                            <>
                                <TextField
                                    label="Prompt Name"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                                <TextField
                                    label="Prompt Content"
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    fullWidth
                                    multiline
                                    rows={15}
                                    margin="normal"
                                />
                                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                    <Button 
                                        startIcon={<CancelIcon />} 
                                        onClick={() => setEditMode(false)}
                                        sx={{ mr: 1 }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button 
                                        variant="contained" 
                                        startIcon={<SaveIcon />} 
                                        onClick={handleSavePrompt}
                                        disabled={!editName || !editContent}
                                    >
                                        Save
                                    </Button>
                                </Box>
                            </>
                        ) : selectedPrompt ? (
                            <>
                                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                    <Typography variant="h6">{selectedPrompt.name}</Typography>
                                    <Box>
                                        <IconButton onClick={handleEditPrompt} color="primary">
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton onClick={handleDeletePrompt} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Divider sx={{ my: 1 }} />
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        whiteSpace: "pre-wrap", 
                                        mt: 2,
                                        p: 2,
                                        bgcolor: "background.paper",
                                        border: 1,
                                        borderColor: "divider",
                                        borderRadius: 1,
                                        height: "350px",
                                        overflow: "auto"
                                    }}
                                >
                                    {selectedPrompt.content}
                                </Typography>
                                <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                                    <Button 
                                        variant="contained" 
                                        onClick={handleSetActive}
                                        disabled={selectedPromptId === activePromptId}
                                    >
                                        Set as Active
                                    </Button>
                                </Box>
                            </>
                        ) : (
                            <Typography variant="body1" sx={{ mt: 10, textAlign: "center" }}>
                                Select a system prompt from the list or create a new one
                            </Typography>
                        )}
                    </Box>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
