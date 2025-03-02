// import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

interface TokenizationDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function TokenizationDialog({ open, onClose }: TokenizationDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Tokenization</DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    Tokenization tools will be implemented here.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
