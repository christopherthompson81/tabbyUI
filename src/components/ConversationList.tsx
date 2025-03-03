import { useState, useRef } from "react";
import {
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    IconButton,
    Button,
    Collapse,
    Box,
    Typography,
    Menu,
    MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import FolderIcon from "@mui/icons-material/Folder";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

// Local imports
import { useReducerContext } from "../reducers/ReducerContext";
import {
    Conversation,
    ConversationFolder,
    getPersistedCurrentConversationId,
} from "../utils/persistence";
// components
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

interface ConversationListProps {
    folders: ConversationFolder[];
    currentConversationId: string;
    onAddConversation: (folderId?: string) => void;
    onSwitchConversation: (id: string) => void;
    onEditConversation: (id: string) => void;
    onAddFolder: (parentFolderId?: string) => void;
    onEditFolder: (id: string) => void;
    onDelete: (id: string) => void;
    onSave: () => void;
}

interface FolderItemProps {
    folder: ConversationFolder;
    currentConversationId: string;
    onAddConversation: (folderId?: string) => void;
    onSwitchConversation: (id: string) => void;
    onEditConversation: (id: string) => void;
    onAddFolder: (parentFolderId?: string) => void;
    onEditFolder: (id: string) => void;
    onDelete: (id: string) => void;
    onSave: () => void;
}

const isParentOfCurrentConversation = (
    folder: ConversationFolder,
    currentId: string
): boolean => {
    // Check if any direct conversation is the current one
    if (folder.conversations.some((conv) => conv.id == currentId)) {
        return true;
    }
    // Recursively check subfolders
    return folder.subfolders.some((subfolder) =>
        isParentOfCurrentConversation(subfolder, currentId)
    );
};

function FolderItem({
    folder,
    currentConversationId,
    onAddConversation,
    onSwitchConversation,
    onEditConversation,
    onAddFolder,
    onEditFolder,
    onDelete,
    onSave,
}: FolderItemProps) {
    const { dispatch } = useReducerContext();
    const [open, setOpen] = useState(
        isParentOfCurrentConversation(folder, currentConversationId)
    );
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [conversationMenuAnchorEl, setConversationMenuAnchorEl] =
        useState<null | HTMLElement>(null);
    const [selectedConversation, setSelectedConversation] =
        useState<Conversation | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const menuOpen = Boolean(menuAnchorEl);

    const handleImportFile = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const importedConv = JSON.parse(text);

            // Find unique ID and name
            let newId = importedConv.id;
            let newName = importedConv.name;
            let counter = 1;

            const allConvs = folder.conversations.concat(
                folder.subfolders.flatMap((sf) => sf.conversations)
            );

            while (allConvs.some((c) => c.id === newId)) {
                newId = `${importedConv.id}_${counter}`;
                counter++;
            }

            counter = 1;
            let baseName = importedConv.name;
            while (allConvs.some((c) => c.name === newName)) {
                newName = `${baseName} (${counter})`;
                counter++;
            }

            const newConv = {
                ...importedConv,
                id: newId,
                name: newName,
                timestamp: Date.now(),
                author: "User",
            };

            dispatch({
                type: "IMPORT_CONVERSATION",
                conversation: newConv,
                folderId: folder.id,
            });
        } catch (error) {
            console.error("Error importing conversation:", error);
            alert(
                "Failed to import conversation. Please check the file format."
            );
        }

        // Reset file input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleConversationMenuClick = (
        event: React.MouseEvent<HTMLElement>,
        conversation: Conversation
    ) => {
        event.stopPropagation();
        setConversationMenuAnchorEl(event.currentTarget);
        setSelectedConversation(conversation);
    };

    const handleConversationMenuClose = (
        event: React.MouseEvent<HTMLElement>
    ) => {
        event.stopPropagation();
        setConversationMenuAnchorEl(null);
    };

    const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
        event.stopPropagation();
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    return (
        <>
            <ListItemButton sx={{ p: 0 }}>
                <Box
                    onClick={() => setOpen(!open)}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        flexGrow: 1,
                        p: "8px 16px", // Match ListItemButton padding
                    }}
                >
                    {open ? (
                        <FolderOpenIcon fontSize="small" />
                    ) : (
                        <FolderIcon fontSize="small" />
                    )}
                    <ListItemText primary={folder.name} sx={{ ml: 1 }} />
                    {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
                <IconButton onClick={handleMenuClick} sx={{ mr: 1 }}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
                <Menu
                    anchorEl={menuAnchorEl}
                    open={menuOpen}
                    onClose={handleMenuClose}
                    onClick={handleMenuClose}
                >
                    <MenuItem
                        onClick={() => {
                            onEditFolder(folder.id);
                            handleMenuClose();
                        }}
                    >
                        Rename Folder
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            onAddConversation(folder.id);
                            handleMenuClose();
                        }}
                    >
                        Add Conversation
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            onAddFolder(folder.id);
                            handleMenuClose();
                        }}
                    >
                        Add Subfolder
                    </MenuItem>
                    <MenuItem
                        onClick={() => {
                            fileInputRef.current?.click();
                            handleMenuClose();
                        }}
                    >
                        Import Conversation
                    </MenuItem>
                </Menu>
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: "none" }}
                    accept="application/json"
                    onChange={handleImportFile}
                />
            </ListItemButton>
            <Collapse in={open} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 2 }}>
                    {folder.subfolders.map((subfolder) => (
                        <FolderItem
                            key={subfolder.id}
                            folder={subfolder}
                            currentConversationId={currentConversationId}
                            onAddConversation={onAddConversation}
                            onSwitchConversation={onSwitchConversation}
                            onEditConversation={onEditConversation}
                            onAddFolder={onAddFolder}
                            onEditFolder={onEditFolder}
                            onDelete={onDelete}
                            onSave={onSave}
                        />
                    ))}
                    {folder.conversations.map((conv) => (
                        <ListItemButton
                            key={conv.id}
                            onClick={() => onSwitchConversation(conv.id)}
                            selected={conv.id === currentConversationId}
                            sx={{
                                pl: 4,
                                backgroundColor:
                                    conv.id == currentConversationId
                                        ? "action.selected"
                                        : "inherit",
                                "&:hover": {
                                    backgroundColor:
                                        conv.id == currentConversationId
                                            ? "action.selected"
                                            : "action.hover",
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    width: "100%",
                                }}
                            >
                                <ListItemText
                                    primary={conv.name}
                                    secondary={new Date(conv.timestamp)
                                        .toLocaleString("en-US", {
                                            year: "numeric",
                                            month: "2-digit",
                                            day: "2-digit",
                                            hour: "2-digit",
                                            minute: "2-digit",
                                            second: "2-digit",
                                            hour12: false,
                                        })
                                        .replace(
                                            /(\d+)\/(\d+)\/(\d+),/,
                                            "$3-$1-$2"
                                        )}
                                />
                            </Box>
                            <IconButton
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleConversationMenuClick(e, conv);
                                }}
                                style={{
                                    marginLeft: "auto",
                                    backgroundColor:
                                        conv.id == currentConversationId
                                            ? "lightGray"
                                            : "",
                                }}
                            >
                                <MoreVertIcon fontSize="small" />
                            </IconButton>
                            <Menu
                                anchorEl={conversationMenuAnchorEl}
                                open={Boolean(conversationMenuAnchorEl)}
                                onClose={handleConversationMenuClose}
                                onClick={handleConversationMenuClose}
                            >
                                <MenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEditConversation(
                                            selectedConversation?.id || ""
                                        );
                                        handleConversationMenuClose(e);
                                    }}
                                >
                                    Rename
                                </MenuItem>
                                <MenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setDeleteDialogOpen(true);
                                        handleConversationMenuClose(e);
                                    }}
                                >
                                    Delete
                                </MenuItem>
                                <MenuItem
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSave();
                                        handleConversationMenuClose(e);
                                    }}
                                >
                                    Save Conversation
                                </MenuItem>
                            </Menu>
                        </ListItemButton>
                    ))}
                </Box>
            </Collapse>
            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onConfirm={() => {
                    if (selectedConversation) {
                        onDelete(selectedConversation.id);
                    }
                    setDeleteDialogOpen(false);
                    setSelectedConversation(null);
                }}
                onCancel={() => setDeleteDialogOpen(false)}
                itemName={selectedConversation?.name || ""}
            />
        </>
    );
}

export default function ConversationList({
    folders,
    onAddConversation,
    onSwitchConversation,
    onEditConversation,
    onAddFolder,
    onEditFolder,
    onDelete,
    onSave,
}: ConversationListProps) {
    const currentConversationId = getPersistedCurrentConversationId();
    return (
        <>
            <List>
                <ListItem>
                    <Typography variant="h6">Conversations</Typography>
                </ListItem>
                {folders.map((folder) => (
                    <FolderItem
                        key={folder.id}
                        folder={folder}
                        currentConversationId={currentConversationId}
                        onAddConversation={onAddConversation}
                        onSwitchConversation={onSwitchConversation}
                        onEditConversation={onEditConversation}
                        onAddFolder={onAddFolder}
                        onEditFolder={onEditFolder}
                        onDelete={onDelete}
                        onSave={onSave}
                    />
                ))}
                <ListItem>
                    <Button
                        variant="contained"
                        fullWidth
                        onClick={() => onAddFolder()}
                    >
                        New Folder
                    </Button>
                </ListItem>
            </List>
        </>
    );
}
