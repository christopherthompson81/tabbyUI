import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box } from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import tabbyImage from '../assets/tabby.png';

interface AboutDialogProps {
  open: boolean;
  onClose: () => void;
}

// Make tabbyAPI a hyperlink to the URL https://github.com/theroyallab/tabbyAPI AI!
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
          A simple chat interface for tabbyAPI
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            startIcon={<GitHubIcon />}
            href="https://github.com/christopherthompson81/tabbyUI"
            target="_blank"
            rel="noopener noreferrer"
          >
            View on GitHub
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
