import React, { useState, useEffect } from 'react';
import { ModelLoadProgress, loadModelWithProgress } from '../services/tabbyAPI';
import { ModelLoadParams, getModelParams, persistModelParams } from '../utils/persistence';
import ProgressDialog from './ProgressDialog';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  Typography, 
  Box, 
  MenuItem, 
  TextField, 
  Select, 
  FormControl, 
  InputLabel,
  Checkbox,
  FormControlLabel,
  Grid
} from '@mui/material';

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
  const [selectedDraftModel, setSelectedDraftModel] = useState('');
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

  const [modelParams, setModelParams] = useState(() => getModelParams(selectedModel));

  const handleParamChange = (field: string, value: any) => {
    setModelParams(prev => {
      const newParams = {
        ...prev,
        [field]: value
      };
      // Save params whenever they change
      if (selectedModel) {
        persistModelParams(selectedModel, newParams);
      }
      return newParams;
    });
  };

  const [loadingProgress, setLoadingProgress] = useState<ModelLoadProgress | null>(null);

  const loadModel = async (modelId: string, draftModelId?: string) => {
    try {
      const payload: ModelLoadParams = {
        ...modelParams,
        model_name: modelId,
        gpu_split: modelParams.gpu_split_auto ? null : modelParams.gpu_split
      };
      
      if (draftModelId) {
        payload.draft_model = {
          draft_model_name: draftModelId,
          draft_rope_scale: 0,
          draft_rope_alpha: 1,
          draft_cache_mode: 'FP16'
        };
      }

      setLoadingProgress({});
      
      await loadModelWithProgress(serverUrl, adminApiKey, payload, (progress) => {
        setLoadingProgress(progress);
      });

      // Refresh models after loading
      await fetchModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load model');
    } finally {
      setLoadingProgress(null);
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
                onChange={(e) => {
                  const modelId = e.target.value as string;
                  setSelectedModel(modelId);
                  // Load saved params when model changes
                  setModelParams(getModelParams(modelId));
                }}
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
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Sequence Length"
                type="number"
                value={modelParams.max_seq_len}
                onChange={(e) => handleParamChange('max_seq_len', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cache Size"
                type="number"
                value={modelParams.cache_size}
                onChange={(e) => handleParamChange('cache_size', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={modelParams.tensor_parallel}
                    onChange={(e) => handleParamChange('tensor_parallel', e.target.checked)}
                  />
                }
                label="Tensor Parallel"
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={modelParams.gpu_split_auto}
                    onChange={(e) => handleParamChange('gpu_split_auto', e.target.checked)}
                  />
                }
                label="GPU Split Auto"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Rope Scale"
                type="number"
                value={modelParams.rope_scale}
                onChange={(e) => handleParamChange('rope_scale', parseFloat(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Rope Alpha"
                type="number"
                value={modelParams.rope_alpha}
                onChange={(e) => handleParamChange('rope_alpha', parseFloat(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Cache Mode"
                value={modelParams.cache_mode}
                onChange={(e) => handleParamChange('cache_mode', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="GPU Split"
                value={modelParams.gpu_split ? modelParams.gpu_split.join(',') : ''}
                onChange={(e) => handleParamChange('gpu_split', e.target.value ? e.target.value.split(',').map(Number) : null)}
                disabled={modelParams.gpu_split_auto}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Chunk Size"
                type="number"
                value={modelParams.chunk_size}
                onChange={(e) => handleParamChange('chunk_size', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Prompt Template"
                value={modelParams.prompt_template}
                onChange={(e) => handleParamChange('prompt_template', e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={modelParams.vision}
                    onChange={(e) => handleParamChange('vision', e.target.checked)}
                  />
                }
                label="Vision"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Num Experts Per Token"
                type="number"
                value={modelParams.num_experts_per_token}
                onChange={(e) => handleParamChange('num_experts_per_token', parseInt(e.target.value))}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={modelParams.skip_queue}
                    onChange={(e) => handleParamChange('skip_queue', e.target.checked)}
                  />
                }
                label="Skip Queue"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Autosplit Reserve"
                value={modelParams.autosplit_reserve ? modelParams.autosplit_reserve.join(',') : ''}
                onChange={(e) => handleParamChange('autosplit_reserve', e.target.value ? e.target.value.split(',').map(Number) : [])}
              />
            </Grid>
            <Grid item xs={6}>
              <FormControl fullWidth>
                <InputLabel>Select Draft Model (Optional)</InputLabel>
                <Select
                  value={selectedDraftModel}
                  onChange={(e) => {
                    setSelectedDraftModel(e.target.value as string);
                    handleParamChange('draft_model', e.target.value ? {
                      draft_model_name: e.target.value,
                      draft_rope_scale: modelParams.draft_model?.draft_rope_scale || 0,
                      draft_rope_alpha: modelParams.draft_model?.draft_rope_alpha || 1,
                      draft_cache_mode: modelParams.draft_model?.draft_cache_mode || 'FP16'
                    } : null)
                  }}
                  label="Select Draft Model"
                >
                  <MenuItem value="">None</MenuItem>
                  {models.map((model) => (
                    <MenuItem key={model.id} value={model.id}>
                      {model.id}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {selectedDraftModel && (
              <>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Draft Rope Scale"
                    type="number"
                    value={modelParams.draft_model?.draft_rope_scale || 0}
                    onChange={(e) => handleParamChange('draft_model', {
                      ...modelParams.draft_model,
                      draft_rope_scale: parseFloat(e.target.value)
                    })}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Draft Rope Alpha"
                    type="number"
                    value={modelParams.draft_model?.draft_rope_alpha || 1}
                    onChange={(e) => handleParamChange('draft_model', {
                      ...modelParams.draft_model,
                      draft_rope_alpha: parseFloat(e.target.value)
                    })}
                  />
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    label="Draft Cache Mode"
                    value={modelParams.draft_model?.draft_cache_mode || 'FP16'}
                    onChange={(e) => handleParamChange('draft_model', {
                      ...modelParams.draft_model,
                      draft_cache_mode: e.target.value
                    })}
                  />
                </Grid>
              </>
            )}
            <Grid item xs={12}>
              <Button 
                variant="contained"
                fullWidth
                onClick={() => selectedModel && loadModel(selectedModel, selectedDraftModel)}
                disabled={!selectedModel}
              >
                Load Selected Model {selectedDraftModel && `with Draft Model`}
              </Button>
            </Grid>
          </Grid>
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
      
      <ProgressDialog
        open={!!loadingProgress}
        progress={loadingProgress}
      />
    </Dialog>
  );
}

export default ModelsDialog;
