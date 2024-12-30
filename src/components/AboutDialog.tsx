import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';
import tabbyImage from '../assets/tabby.png';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function AboutDialog({ open, onClose }: AboutDialogProps) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>About tabbyUI</DialogTitle>
      <DialogContent>
        <img src={tabbyImage} width="250" alt="Tabby" style={{ display: 'block', margin: '0 auto' }} />
        <Typography variant="h4" align="center" sx={{ mt: 2 }}>
          tabbyUI
        </Typography>
        <Typography variant="body1" align="center" sx={{ mt: 2 }}>
          A simple chat interface for Tabby
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
