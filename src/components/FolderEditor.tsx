import { ChangeEvent } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
} from "@mui/material";

interface FolderEditorProps {
    editingFolderId: string | null;
    newFolderName: string;
    onNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
    onSave: () => void;
    onDelete: () => void;
    onCancel: () => void;
}

export default function FolderEditor({
    editingFolderId,
    newFolderName,
    onNameChange,
    onSave,
    onDelete,
    onCancel,
}: FolderEditorProps) {
    return (
        <Dialog open={editingFolderId !== null} onClose={onCancel}>
            <DialogTitle>Edit Folder</DialogTitle>
            <DialogContent>
                <TextField
                    label="Folder Name"
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    value={newFolderName}
                    onChange={onNameChange}
                />
            </DialogContent>
            <DialogActions>
                <Button color="error" onClick={onDelete}>
                    Delete
                </Button>
                <Button onClick={onSave}>Save</Button>
                <Button onClick={onCancel}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
}
