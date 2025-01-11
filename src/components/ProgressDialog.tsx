import { Dialog, DialogTitle, DialogContent, LinearProgress, Typography, Box } from '@mui/material';

interface ProgressDialogProps {
  open: boolean;
  progress: ModelLoadProgress | null;
}

export default function ProgressDialog({ open, progress }: ProgressDialogProps) {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Loading Model</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Loading {progress?.model_type}: {progress?.status}
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Module {progress?.module} of {progress?.modules}
          </Typography>
          <LinearProgress 
            variant="determinate"
            value={progress ? (progress.module / progress.modules) * 100 : 0}
            sx={{ mt: 2, height: 8 }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
