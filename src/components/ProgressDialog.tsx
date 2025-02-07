import {
    Dialog,
    DialogTitle,
    DialogContent,
    LinearProgress,
    Typography,
    Box,
} from "@mui/material";
import { modelLoadProgressDefault, ModelLoadProgress } from "../services/tabbyAPI";
import { useState, useEffect } from "react";

interface ProgressDialogProps {
    open: boolean;
    progress: ModelLoadProgress | null;
}

export default function ProgressDialog({
    open,
    progress,
}: ProgressDialogProps) {
    const [modelProgress, setModelProgress] = useState<ModelLoadProgress>({});

    useEffect(() => {
        if (progress && progress.model_type) {
            // there is a linting error here related to '[progress.model_type]'. It says a computed property must have a type of string, number, symbol or any. Is there a fix? AI!
            setModelProgress((prev) => ({
                ...prev,
                [progress.model_type]: {
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
            if (modelProgress.model_type) {
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
