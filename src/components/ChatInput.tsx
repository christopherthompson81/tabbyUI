import { TextField, Button } from '@mui/material';

export default function ChatInput({
  value,
  onChange,
  onSend,
  onRegenerate
}) {
  return (
    <>
      <TextField
        label="Enter your message"
        variant="outlined"
        fullWidth
        value={value}
        onChange={onChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && value.trim()) {
            onSend();
          }
        }}
      />
      <Button variant="contained" onClick={onSend}>
        Send
      </Button>
      <Button variant="contained" onClick={onRegenerate}>
        Regenerate
      </Button>
    </>
  );
}
