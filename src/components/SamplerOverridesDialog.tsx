import React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
} from "@mui/material";

interface SamplerOverridesDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function SamplerOverridesDialog({ open, onClose }: SamplerOverridesDialogProps) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Sampler Overrides</DialogTitle>
            <DialogContent>
                <Typography variant="body1">
                    Sampler override configuration will be implemented here.
                </Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
