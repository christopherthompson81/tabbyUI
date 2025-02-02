import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

// implement a typescript interface for this function's parameters. AI!

export default function ConversationEditor({
  editingConversationId,
  newConversationName,
  onNameChange,
  onSave,
  onDelete,
  onCancel
}) {
  return (
    <Dialog open={editingConversationId !== null} onClose={onCancel}>
      <DialogTitle>Edit Conversation Name</DialogTitle>
      <DialogContent>
        <TextField
          label="Conversation Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={newConversationName}
          onChange={onNameChange}
        />
      </DialogContent>
      <DialogActions>
        <Button color="error" onClick={onDelete}>
          Delete
        </Button>
        <Button onClick={onSave}>
          Save
        </Button>
        <Button onClick={onCancel}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
}
