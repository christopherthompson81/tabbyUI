import { TextField, Button, IconButton, Box, Chip, Stack, Tooltip, Dialog, DialogContent } from '@mui/material';
import { useModelLoader, ModelLoaderForm } from './ModelLoader';
import { useState } from 'react';
import { MessageContent, getModelInfo } from '../services/tabbyAPI';
import ImageIcon from '@mui/icons-material/Image';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';

import IconRadioGroup from './IconRadioGroup';
import AdjustIcon from '@mui/icons-material/Adjust';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CodeIcon from '@mui/icons-material/Code';
import BrainIcon from "./BrainIcon";

interface ChatInputProps {
  onSend: (preview: MessageContent[], selectedModel?: string) => void;
  onRegenerate: () => void;
  serverUrl: string;
  adminApiKey: string;
}

export default function ChatInput({
  onSend,
  onRegenerate,
  serverUrl,
  adminApiKey
}: ChatInputProps) {
  const [modelLoaderOpen, setModelLoaderOpen] = useState(false);
  const modelLoader = useModelLoader({ 
    serverUrl, 
    adminApiKey,
    onLoadComplete: () => setModelLoaderOpen(false)
  });
  const [inputText, setInputText] = useState('');
  const [messagePreview, setMessagePreview] = useState<MessageContent[]>([]);

  const [selectedValue, setSelectedValue] = useState('current');

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

  const handleRegenerate = async () => {
    // Get model preferences from localStorage
    const modelPreferences = JSON.parse(
      localStorage.getItem('modelPreferences') || '{}'
    );
    
    // Get selected model ID if not 'current'
    const selectedModel = selectedValue !== 'current' 
      ? modelPreferences[selectedValue]
      : undefined;

    if (selectedModel) {
      // Fetch current model to compare
      const currentModel = await getModelInfo(serverUrl, adminApiKey);
      
      // If selected model is different from current, load it
      if (currentModel.id !== selectedModel) {
        await modelLoader.loadModel(selectedModel);
      }
    }

    onRegenerate();
  };

  const handleSend = async () => {
    // Get model preferences from localStorage
    const modelPreferences = JSON.parse(
      localStorage.getItem('modelPreferences') || '{}'
    );
    
    // Get selected model ID if not 'current'
    const selectedModel = selectedValue !== 'current' 
      ? modelPreferences[selectedValue]
      : undefined;

    if (selectedModel) {
      // Fetch current model to compare
      const currentModel = await getModelInfo(serverUrl, adminApiKey);
      
      // If selected model is different from current, load it
      if (currentModel.id !== selectedModel) {
        await modelLoader.loadModel(selectedModel);
      }
    }

    onSend(messagePreview, selectedModel);
    setMessagePreview([]);
  };

  return (
    <div>
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
      <Box sx={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: "center" }}>
        <IconRadioGroup
          value={selectedValue}
          onChange={(value) => setSelectedValue(value)}
          options={[
            { value: 'current', tooltip: "Current Model", icon: <AdjustIcon /> },
            { value: 'Assistant', tooltip: "Assistant", icon: <SupportAgentIcon /> },
            { value: 'Vision', tooltip: "Vision Model", icon: <VisibilityIcon /> },
            { value: 'Coding', tooltip: "Coding Model", icon: <CodeIcon /> },
            { value: 'Chain-of-Thought', tooltip: "Reasoning Model", icon: <BrainIcon /> },
          ]}
        />
        <Box sx={{alignItems: "center"}}>
          <Button 
            variant="contained" 
            onClick={handleSend}
            disabled={messagePreview.length === 0}
          >
            Send
          </Button>
          <Button 
            variant="contained" 
            onClick={handleRegenerate}
          >
            Regenerate
          </Button>
        </Box>
      </Box>
    </Box>
    
    <Dialog open={modelLoaderOpen} onClose={() => setModelLoaderOpen(false)}>
      <DialogContent>
        <ModelLoaderForm {...modelLoader} />
      </DialogContent>
    </Dialog>
    </div>
  );
}
