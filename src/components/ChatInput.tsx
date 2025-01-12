import { TextField, Button, IconButton, Box, Chip, Stack, Tooltip } from '@mui/material';
import { useState } from 'react';
import { MessageContent } from '../services/tabbyAPI';
import ImageIcon from '@mui/icons-material/Image';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';

import IconRadioGroup from './IconRadioGroup';
import AdjustIcon from '@mui/icons-material/Adjust';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CodeIcon from '@mui/icons-material/Code';
import BrainIcon from "./BrainIcon";

export default function ChatInput({
  onSend,
  onRegenerate
}) {
  const [inputText, setInputText] = useState('');
  const [messagePreview, setMessagePreview] = useState<MessageContent[]>([]);

  const [selectedValue, setSelectedValue] = useState('option1');

  const handleTextChange = (e) => {
    setInputText(e.target.value);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target.result;
        setMessagePreview(prev => [
          ...prev,
          { type: 'image_url', image_url: { url: imageUrl } }
        ]);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddText = () => {
    if (inputText.trim()) {
      setMessagePreview(prev => [
        ...prev,
        { type: 'text', text: inputText }
      ]);
      setInputText('');
    }
  };

  const handleRemoveItem = (index: number) => {
    setMessagePreview(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {/* Message Preview */}
      {messagePreview.length > 0 && (
        <Box sx={{
          p: 2,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          backgroundColor: 'background.paper'
        }}>
          <Stack direction="column" spacing={1}>
            {messagePreview.map((item, index) => (
              <Box key={index} sx={{ position: 'relative' }}>
                {item.type === 'text' && (
                  <Chip
                    label={item.text}
                    onDelete={() => handleRemoveItem(index)}
                    deleteIcon={<CancelIcon />}
                    sx={{ 
                      maxWidth: '100%',
                      '& .MuiChip-label': {
                        whiteSpace: 'normal'
                      }
                    }}
                  />
                )}
                {item.type === 'image_url' && item.image_url && (
                  <Box sx={{ position: 'relative' }}>
                    <img
                      src={item.image_url.url}
                      alt="Preview"
                      style={{ 
                        maxWidth: '100%',
                        maxHeight: '200px',
                        borderRadius: '4px'
                      }}
                    />
                    <IconButton
                      size="small"
                      onClick={() => handleRemoveItem(index)}
                      sx={{
                        position: 'absolute',
                        right: 4,
                        top: 4,
                        backgroundColor: 'background.paper'
                      }}
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Input Area */}
      <Box sx={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <TextField
          label="Enter your message"
          variant="outlined"
          fullWidth
          value={inputText}
          onChange={handleTextChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && inputText.trim()) {
              handleAddText();
            }
          }}
        />
        <Tooltip title="Add Text">
          <IconButton 
            color="primary" 
            onClick={handleAddText}
            disabled={!inputText.trim()}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>
        <input
          accept="image/*"
          style={{ display: 'none' }}
          id="icon-button-file"
          type="file"
          onChange={handleImageUpload}
        />
        <Tooltip title="Add Image">
          <label htmlFor="icon-button-file">
            <IconButton color="primary" component="span">
              <ImageIcon />
            </IconButton>
          </label>
        </Tooltip>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <IconRadioGroup
          value={selectedValue}
          onChange={(value) => setSelectedValue(value)}
          options={[
            { value: 'option1', tooltip: "Current Model", icon: <AdjustIcon /> },
            { value: 'option2', tooltip: "Assistant", icon: <SupportAgentIcon /> },
            { value: 'option3', tooltip: "Vision Model", icon: <VisibilityIcon /> },
            { value: 'option4', tooltip: "Coding Model", icon: <CodeIcon /> },
            { value: 'option5', tooltip: "Reasoning Model", icon: <BrainIcon /> },
          ]}
        />
        <Button 
          variant="contained" 
          onClick={() => {
            onSend(messagePreview);
            setMessagePreview([]);
          }}
          disabled={messagePreview.length === 0}
        >
          Send
        </Button>
        <Button 
          variant="contained" 
          onClick={onRegenerate}
        >
          Regenerate
        </Button>
      </Box>
    </Box>
  );
}
