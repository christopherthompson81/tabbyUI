import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';
import { ChangeEvent } from 'react';

interface ConversationEditorProps {
  editingConversationId: string | null;
  newConversationName: string;
  onNameChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
}

export default function ConversationEditor({
  editingConversationId,
  newConversationName,
  onNameChange,
  onSave,
  onDelete,
  onCancel
}: ConversationEditorProps) {
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
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={onSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
