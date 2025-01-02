import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Box, MenuItem, TextField, Select, FormControl, InputLabel } from '@mui/material';

interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

interface ModelPreferences {
  [taskType: string]: string; // Maps task type to model ID
}

interface ModelsDialogProps {
  open: boolean;
  onClose: () => void;
  serverUrl: string;
  adminApiKey: string;
}

function ModelsDialog({ open, onClose, serverUrl, adminApiKey }: ModelsDialogProps) {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [preferences, setPreferences] = useState<ModelPreferences>(() => {
    const saved = localStorage.getItem('modelPreferences');
    return saved ? JSON.parse(saved) : {};
  });

  useEffect(() => {
    if (open) {
      fetchModels();
    }
  }, [open]);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/v1/models`, {
        headers: {
          'x-api-key': adminApiKey
        }
      });
      if (!response.ok) throw new Error('Failed to fetch models');
      const data = await response.json();
      setModels(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  const loadModel = async (modelId: string) => {
    try {
      const response = await fetch(`${serverUrl}/v1/model/load`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-key': adminApiKey
        },
        body: JSON.stringify({ model: modelId })
      });
      if (!response.ok) throw new Error('Failed to load model');
      // Refresh models after loading
      await fetchModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
    }
  };

  const savePreferences = (newPreferences: ModelPreferences) => {
    setPreferences(newPreferences);
    localStorage.setItem('modelPreferences', JSON.stringify(newPreferences));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Model Management</DialogTitle>
      <DialogContent>
        {error && <Typography color="error">{error}</Typography>}
        
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6">Available Models</Typography>
          {loading ? (
            <Typography>Loading models...</Typography>
          ) : (
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Select Model</InputLabel>
              <Select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as string)}
                label="Select Model"
              >
                {models.map((model) => (
                  <MenuItem key={model.id} value={model.id}>
                    {model.id}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={() => selectedModel && loadModel(selectedModel)}
            disabled={!selectedModel}
          >
            Load Selected Model
          </Button>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6">Model Preferences</Typography>
          {['Vision', 'Chain-of-Thought', 'Coding', 'Assistant'].map((taskType) => (
            <Box key={taskType} sx={{ mt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>{taskType} Model</InputLabel>
                <Select
                  value={preferences[taskType] || ''}
                  onChange={(e) => 
                    savePreferences({ ...preferences, [taskType]: e.target.value })
                  }
                  label={`${taskType} Model`}
                >
                  <MenuItem value="">Default</MenuItem>
                  {models.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ModelsDialog;
