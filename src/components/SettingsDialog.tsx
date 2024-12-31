import React from 'react';
import { ChangeEvent } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Box, MenuItem } from '@mui/material';

interface GenerationParams {
  maxTokens: string | number;
  temperature: string | number;
  topP: string | number;
  topK: string | number;
  frequencyPenalty: string | number;
  presencePenalty: string | number;
  repetitionPenalty: string | number;
  typicalP: string | number;
  minTokens: string | number;
  generateWindow: string | number;
  tokenHealing: string;
  mirostatMode: string | number;
  mirostatTau: string | number;
  mirostatEta: string | number;
  addBosToken: string;
  banEosToken: string;
}

interface SettingsDialogProps {
  open: boolean;
  onClose: () => void;
  serverUrl: string;
  onServerUrlChange: (e: ChangeEvent<HTMLInputElement>) => void;
  apiKey: string;
  onApiKeyChange: (e: ChangeEvent<HTMLInputElement>) => void;
  adminApiKey: string;
  onAdminApiKeyChange: (e: ChangeEvent<HTMLInputElement>) => void;
  generationParams: GenerationParams;
  onGenerationParamsChange: (key: keyof GenerationParams, value: string) => void;
}

function SettingsDialog({
  open,
  onClose,
  serverUrl,
  onServerUrlChange,
  apiKey,
  onApiKeyChange,
  adminApiKey,
  onAdminApiKeyChange,
  generationParams,
  onGenerationParamsChange
}: SettingsDialogProps) {
  const handleParamChange = (e: React.ChangeEvent<HTMLInputElement>, param: any) => {
    const value = e.target.value;
    if (param.type === 'number' && isNaN(Number(value))) return;
    onGenerationParamsChange(param.key as keyof GenerationParams, value);
  };
  
  const generationParamLabels = [
    { label: 'Max Tokens', key: 'maxTokens', type: 'number' },
    { label: 'Temperature', key: 'temperature', type: 'number' },
    { label: 'Top P', key: 'topP', type: 'number' },
    { label: 'Top K', key: 'topK', type: 'number' },
    { label: 'Frequency Penalty', key: 'frequencyPenalty', type: 'number' },
    { label: 'Presence Penalty', key: 'presencePenalty', type: 'number' },
    { label: 'Repetition Penalty', key: 'repetitionPenalty', type: 'number' },
    { label: 'Typical P', key: 'typicalP', type: 'number' },
  ]
  const advancedParamLabels1 = [
    { label: 'Min Tokens', key: 'minTokens', type: 'number' },
    { label: 'Generate Window', key: 'generateWindow', type: 'number' },
    { label: 'Mirostat Mode', key: 'mirostatMode', type: 'number' },
    { label: 'Mirostat Tau', key: 'mirostatTau', type: 'number' },
    { label: 'Mirostat Eta', key: 'mirostatEta', type: 'number' },
  ]
  const advancedParamLabels2 = [
    { label: 'Token Healing', key: 'tokenHealing', options: ['true', 'false'] },
    { label: 'Add BOS Token', key: 'addBosToken', options: ['true', 'false'] },
    { label: 'Ban EOS Token', key: 'banEosToken', options: ['true', 'false'] },
  ]
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <TextField label="Server URL" variant="outlined" fullWidth margin="normal" 
          value={serverUrl} onChange={onServerUrlChange} />
        <TextField label="API Key" variant="outlined" fullWidth margin="normal" 
          value={apiKey} onChange={onApiKeyChange} />
        <TextField label="Admin API Key" variant="outlined" fullWidth margin="normal"
          value={adminApiKey} onChange={onAdminApiKeyChange} />
        
        <Typography variant="h6" sx={{ mt: 2 }}>Generation Parameters</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {generationParamLabels.map((param) => (
            <TextField
              key={param.key}
              label={param.label}
              type={param.type}
              variant="outlined"
              value={generationParams[param.key as keyof GenerationParams]}
              onChange={(e) => handleParamChange(e, param)}
            />
          ))}
        </Box>

        <Typography variant="h6" sx={{ mt: 2 }}>Advanced Parameters</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          {advancedParamLabels1.map((param) => (
            <TextField
              key={param.key}
              label={param.label}
              type={param.type}
              variant="outlined"
              value={generationParams[param.key as keyof GenerationParams]}
              onChange={(e) => handleParamChange(e, param)}
            />
          ))}
          
          {advancedParamLabels2.map((param) => (
            <TextField
              key={param.key}
              label={param.label}
              select
              variant="outlined"
              value={generationParams[param.key as keyof GenerationParams]}
              onChange={(e) => handleParamChange(e, param)}
            >
              {param.options.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Save Settings
        </Button>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default SettingsDialog;