import { Dialog, DialogTitle, DialogContent, LinearProgress, Typography, Box } from '@mui/material';

interface ProgressDialogProps {
  open: boolean;
  progress: number;
  status: string;
  message?: string;
}

export default function ProgressDialog({ open, progress, status, message }: ProgressDialogProps) {
  return (
    <Dialog open={open} maxWidth="sm" fullWidth>
      <DialogTitle>Loading Model</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <Typography variant="body1" gutterBottom>
            Status: {status}
          </Typography>
          {message && (
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {message}
            </Typography>
          )}
          <LinearProgress 
            variant="determinate"
            value={progress || 0}
            sx={{ mt: 2, height: 8 }}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
