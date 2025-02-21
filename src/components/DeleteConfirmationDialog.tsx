import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

interface DeleteConfirmationDialogProps {
    open: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    itemName: string;
}

export default function DeleteConfirmationDialog({
    open,
    onConfirm,
    onCancel,
    itemName,
}: DeleteConfirmationDialogProps) {
    return (
        <Dialog open={open} onClose={onCancel}>
            <DialogTitle>Confirm Delete</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete "{itemName}"? This action
                    cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onCancel}>Cancel</Button>
                <Button color="error" onClick={onConfirm}>
                    Delete
                </Button>
            </DialogActions>
        </Dialog>
    );
}
