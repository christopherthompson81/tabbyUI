import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Typography, Box, MenuItem } from '@mui/material';

export default function SettingsDialog({
  open,
  onClose,
  serverUrl,
  onServerUrlChange,
  apiKey,
  onApiKeyChange,
  generationParams,
  onGenerationParamsChange
}) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Settings</DialogTitle>
      <DialogContent>
        <TextField label="Server URL" variant="outlined" fullWidth margin="normal" 
          value={serverUrl} onChange={onServerUrlChange} />
        <TextField label="API Key" variant="outlined" fullWidth margin="normal" 
          value={apiKey} onChange={onApiKeyChange} />
        
        <Typography variant="h6" sx={{ mt: 2 }}>Generation Parameters</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          <TextField label="Max Tokens" type="number" variant="outlined" 
            value={generationParams.maxTokens} onChange={e => onGenerationParamsChange('maxTokens', e.target.value)} />
          <TextField label="Temperature" type="number" variant="outlined" 
            value={generationParams.temperature} onChange={e => onGenerationParamsChange('temperature', e.target.value)} />
          <TextField label="Top P" type="number" variant="outlined" 
            value={generationParams.topP} onChange={e => onGenerationParamsChange('topP', e.target.value)} />
          <TextField label="Top K" type="number" variant="outlined" 
            value={generationParams.topK} onChange={e => onGenerationParamsChange('topK', e.target.value)} />
          <TextField label="Frequency Penalty" type="number" variant="outlined" 
            value={generationParams.frequencyPenalty} onChange={e => onGenerationParamsChange('frequencyPenalty', e.target.value)} />
          <TextField label="Presence Penalty" type="number" variant="outlined" 
            value={generationParams.presencePenalty} onChange={e => onGenerationParamsChange('presencePenalty', e.target.value)} />
          <TextField label="Repetition Penalty" type="number" variant="outlined" 
            value={generationParams.repetitionPenalty} onChange={e => onGenerationParamsChange('repetitionPenalty', e.target.value)} />
          <TextField label="Typical P" type="number" variant="outlined" 
            value={generationParams.typicalP} onChange={e => onGenerationParamsChange('typicalP', e.target.value)} />
        </Box>

        <Typography variant="h6" sx={{ mt: 2 }}>Advanced Parameters</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 2 }}>
          <TextField label="Min Tokens" type="number" variant="outlined" 
            value={generationParams.minTokens} onChange={e => onGenerationParamsChange('minTokens', e.target.value)} />
          <TextField label="Generate Window" type="number" variant="outlined" 
            value={generationParams.generateWindow} onChange={e => onGenerationParamsChange('generateWindow', e.target.value)} />
          <TextField label="Token Healing" select variant="outlined" 
            value={generationParams.tokenHealing} onChange={e => onGenerationParamsChange('tokenHealing', e.target.value)}>
            <MenuItem value="true">True</MenuItem>
            <MenuItem value="false">False</MenuItem>
          </TextField>
          <TextField label="Mirostat Mode" type="number" variant="outlined" 
            value={generationParams.mirostatMode} onChange={e => onGenerationParamsChange('mirostatMode', e.target.value)} />
          <TextField label="Mirostat Tau" type="number" variant="outlined" 
            value={generationParams.mirostatTau} onChange={e => onGenerationParamsChange('mirostatTau', e.target.value)} />
          <TextField label="Mirostat Eta" type="number" variant="outlined" 
            value={generationParams.mirostatEta} onChange={e => onGenerationParamsChange('mirostatEta', e.target.value)} />
          <TextField label="Add BOS Token" select variant="outlined" 
            value={generationParams.addBosToken} onChange={e => onGenerationParamsChange('addBosToken', e.target.value)}>
            <MenuItem value="true">True</MenuItem>
            <MenuItem value="false">False</MenuItem>
          </TextField>
          <TextField label="Ban EOS Token" select variant="outlined" 
            value={generationParams.banEosToken} onChange={e => onGenerationParamsChange('banEosToken', e.target.value)}>
            <MenuItem value="true">True</MenuItem>
            <MenuItem value="false">False</MenuItem>
          </TextField>
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
