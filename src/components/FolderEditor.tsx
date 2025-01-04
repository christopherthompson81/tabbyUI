import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from '@mui/material';

export default function FolderEditor({
  editingFolderId,
  newFolderName,
  onNameChange,
  onSave,
  onDelete,
  onCancel
}) {
  return (
    <Dialog open={editingFolderId !== null} onClose={onCancel}>
      <DialogTitle>Edit Folder</DialogTitle>
      <DialogContent>
        <TextField
          label="Folder Name"
          variant="outlined"
          fullWidth
          margin="normal"
          value={newFolderName}
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
