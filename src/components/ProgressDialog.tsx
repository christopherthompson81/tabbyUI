import {
    Dialog,
    DialogTitle,
    DialogContent,
    LinearProgress,
    Typography,
    Box,
} from "@mui/material";
import { ModelLoadProgress } from "../services/tabbyAPI";
import { useState, useEffect } from "react";

interface ProgressDialogProps {
    open: boolean;
    progress: ModelLoadProgress | null;
}

export default function ProgressDialog({
    open,
    progress,
}: ProgressDialogProps) {
    const [modelProgress, setModelProgress] = useState<ModelLoadProgress | {}>({});

    useEffect(() => {
        if (progress && progress.model_type) {
            setModelProgress((prev) => ({
                ...prev,
                [progress.model_type as string]: {
                    module: progress.module,
                    modules: progress.modules,
                    status: progress.status,
                },
            }));
        }
    }, [progress]);

    // Clear progress when dialog closes
    useEffect(() => {
        if (!open) {
            if (JSON.stringify(modelProgress) !== JSON.stringify({})) {
                console.log(modelProgress);
            }
            setModelProgress({});
        }
    }, [open]);

    return (
        <Dialog open={open} maxWidth="sm" fullWidth>
            <DialogTitle>Loading Models</DialogTitle>
            <DialogContent>
                <Box sx={{ mt: 2 }}>
                    {Object.entries(modelProgress).map(
                        ([modelType, progress]) => (
                            <Box key={modelType} sx={{ mb: 3 }}>
                                <Typography variant="body1" gutterBottom>
                                    Loading {modelType}: {progress.status}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    Module {progress.module} of{" "}
                                    {progress.modules}
                                </Typography>
                                <LinearProgress
                                    variant="determinate"
                                    value={
                                        (progress.module / progress.modules) *
                                        100
                                    }
                                    sx={{ mt: 1, height: 8 }}
                                />
                            </Box>
                        )
                    )}
                </Box>
            </DialogContent>
        </Dialog>
    );
}
