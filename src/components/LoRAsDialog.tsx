//import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

interface LoRAsDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function LoRAsDialog({ open, onClose }: LoRAsDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>LoRAs</DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    LoRA management will be implemented here.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
