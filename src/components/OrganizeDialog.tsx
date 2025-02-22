import { useState } from "react";
import { useReducerContext } from "../reducers/ReducerContext";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Grid,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Paper,
    Typography,
    IconButton,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import ChatIcon from "@mui/icons-material/Chat";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import { ConversationFolder, Conversation } from "../utils/persistence";

interface OrganizeDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function OrganizeDialog({ open, onClose }: OrganizeDialogProps) {
    const { folders, dispatch } = useReducerContext();
    const [leftPath, setLeftPath] = useState<string[]>(["root"]);
    const [rightPath, setRightPath] = useState<string[]>(["root"]);
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

    const findFolder = (folderId: string): ConversationFolder | undefined => {
        const findInFolders = (folders: ConversationFolder[]): ConversationFolder | undefined => {
            for (const folder of folders) {
                if (folder.id === folderId) return folder;
                const found = findInFolders(folder.subfolders);
                if (found) return found;
            }
            return undefined;
        };
        return findInFolders(folders);
    };

    const getCurrentLeftFolder = () => findFolder(leftPath[leftPath.length - 1]) || folders[0];
    const getCurrentRightFolder = () => findFolder(rightPath[rightPath.length - 1]) || folders[0];

    const handleItemSelect = (id: string) => {
        const newSelected = new Set(selectedItems);
        if (selectedItems.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const navigateFolder = (side: "left" | "right", folderId: string) => {
        if (side === "left") {
            setLeftPath([...leftPath, folderId]);
        } else {
            setRightPath([...rightPath, folderId]);
        }
    };

    const navigateUp = (side: "left" | "right") => {
        if (side === "left" && leftPath.length > 1) {
            setLeftPath(leftPath.slice(0, -1));
        } else if (side === "right" && rightPath.length > 1) {
            setRightPath(rightPath.slice(0, -1));
        }
    };

    const moveItems = (direction: "left" | "right") => {
        const sourceFolder =
            direction === "right"
                ? getCurrentLeftFolder()
                : getCurrentRightFolder();
        const targetFolder =
            direction === "right"
                ? getCurrentRightFolder()
                : getCurrentLeftFolder();

        dispatch({
            type: "MOVE_ITEMS",
            sourceFolder,
            targetFolder,
            itemIds: Array.from(selectedItems),
        });

        // Move selected items in dialog data.
        const movedConversations: Conversation[] = [];
        const movedFolders: ConversationFolder[] = [];

        sourceFolder.conversations = sourceFolder.conversations.filter(
            (conv) => {
                if (selectedItems.has(conv.id)) {
                    movedConversations.push({ ...conv });
                    return false;
                }
                return true;
            }
        );

        targetFolder.conversations.push(...movedConversations);
        targetFolder.subfolders.push(...movedFolders);

        setSelectedItems(new Set());
    };

    const renderPanel = (side: "left" | "right") => {
        const currentFolder =
            side === "left" ? getCurrentLeftFolder() : getCurrentRightFolder();
        const path = side === "left" ? leftPath : rightPath;
        
        // Get folder names for the path
        const pathNames = path.map(id => findFolder(id)?.name || id);
        
        return (
            <Paper sx={{ height: "400px", overflow: "auto", p: 1 }}>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Path: {pathNames.join(" / ")}
                </Typography>
                <List dense>
                    {currentFolder.subfolders.map((folder) => (
                        <ListItem
                            key={folder.id}
                            button
                            selected={selectedItems.has(folder.id)}
                            onClick={() => handleItemSelect(folder.id)}
                            onDoubleClick={() => navigateFolder(side, folder.id)}
                            className={
                                selectedItems.has(folder.id)
                                    ? "organize-item-selected"
                                    : "organize-item"
                            }
                        >
                            <ListItemIcon>
                                <FolderIcon />
                            </ListItemIcon>
                            <ListItemText primary={folder.name} />
                        </ListItem>
                    ))}
                    {currentFolder.conversations.map((conv) => (
                        <ListItem
                            key={conv.id}
                            button
                            selected={selectedItems.has(conv.id)}
                            onClick={() => handleItemSelect(conv.id)}
                            className={
                                selectedItems.has(conv.id)
                                    ? "organize-item-selected"
                                    : "organize-item"
                            }
                        >
                            <ListItemIcon>
                                <ChatIcon />
                            </ListItemIcon>
                            <ListItemText primary={conv.name} />
                        </ListItem>
                    ))}
                </List>
            </Paper>
        );
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Organize Conversations</DialogTitle>
            <DialogContent>
                <Grid container spacing={2}>
                    <Grid item xs={5}>
                        {renderPanel("left")}
                        <Button
                            size="small"
                            onClick={() => navigateUp("left")}
                            disabled={leftPath.length <= 1}
                        >
                            Up
                        </Button>
                    </Grid>
                    <Grid
                        item
                        xs={2}
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <IconButton
                            onClick={() => moveItems("right")}
                            disabled={selectedItems.size === 0}
                        >
                            <ChevronRightIcon />
                        </IconButton>
                        <IconButton
                            onClick={() => moveItems("left")}
                            disabled={selectedItems.size === 0}
                        >
                            <ChevronLeftIcon />
                        </IconButton>
                    </Grid>
                    <Grid item xs={5}>
                        {renderPanel("right")}
                        <Button
                            size="small"
                            onClick={() => navigateUp("right")}
                            disabled={rightPath.length <= 1}
                        >
                            Up
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
