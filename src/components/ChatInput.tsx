import { TextField, Button, IconButton } from '@mui/material';
import { useState } from 'react';
import { MessageContent } from '../services/tabbyAPI';
import ImageIcon from '@mui/icons-material/Image';

export default function ChatInput({
  value,
  onChange,
  onSend,
  onRegenerate
}) {
  const [inputText, setInputText] = useState('');

  const handleTextChange = useCallback(
    debounce((e) => {
      setInputText(e.target.value);
      // Convert text to MessageContent format
      onChange([{ type: 'text', text: e.target.value }]);
    }, 200),
    []
  );

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        // Add image to MessageContent array
        onChange([...value, { type: 'image_url', image_url: { url: imageUrl } }]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
      <TextField
        label="Enter your message"
        variant="outlined"
        fullWidth
        value={inputText}
        onChange={handleTextChange}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && (inputText.trim() || value.length > 0)) {
            onSend();
            setInputText('');
          }
        }}
      />
      <input
        accept="image/*"
        style={{ display: 'none' }}
        id="icon-button-file"
        type="file"
        onChange={handleImageUpload}
      />
      <label htmlFor="icon-button-file">
        <IconButton color="primary" component="span">
          <ImageIcon />
        </IconButton>
      </label>
      <Button variant="contained" onClick={() => {
        onSend();
        setInputText('');
      }}>
        Send
      </Button>
      <Button variant="contained" onClick={onRegenerate}>
        Regenerate
      </Button>
    </div>
  );
}
