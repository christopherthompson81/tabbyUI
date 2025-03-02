import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

interface TemplatesDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function TemplatesDialog({ open, onClose }: TemplatesDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Templates</DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    Template management will be implemented here.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
