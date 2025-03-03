import React, { useState } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    TextField,
    Grid,
    Paper,
    Box,
    Tabs,
    Tab,
    FormControlLabel,
    Checkbox,
    Chip,
    Alert,
    CircularProgress,
    Divider,
} from "@mui/material";
import { useReducerContext } from "../reducers/ReducerContext";
import {
    encodeTokens,
    decodeTokens,
    TokenEncodeRequest,
    TokenDecodeRequest,
} from "../services/tabbyAPI";

interface TokenizationDialogProps {
    open: boolean;
    onClose: () => void;
}

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tokenization-tabpanel-${index}`}
            aria-labelledby={`tokenization-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
        </div>
    );
}

export default function TokenizationDialog({ open, onClose }: TokenizationDialogProps) {
    const { settings } = useReducerContext();
    const [tabValue, setTabValue] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Encode tab state
    const [textToEncode, setTextToEncode] = useState("");
    const [encodedTokens, setEncodedTokens] = useState<number[]>([]);
    const [tokenCount, setTokenCount] = useState(0);
    const [addBosTokenEncode, setAddBosTokenEncode] = useState(true);
    const [encodeSpecialTokens, setEncodeSpecialTokens] = useState(true);
    const [decodeSpecialTokensEncode, setDecodeSpecialTokensEncode] = useState(true);

    // Decode tab state
    const [tokensToDecode, setTokensToDecode] = useState("");
    const [decodedText, setDecodedText] = useState("");
    const [addBosTokenDecode, setAddBosTokenDecode] = useState(true);
    const [encodeSpecialTokensDecode, setEncodeSpecialTokensDecode] = useState(true);
    const [decodeSpecialTokensDecode, setDecodeSpecialTokensDecode] = useState(true);

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleEncode = async () => {
        if (!textToEncode.trim()) {
            setError("Please enter text to encode");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const request: TokenEncodeRequest = {
                text: textToEncode,
                add_bos_token: addBosTokenEncode,
                encode_special_tokens: encodeSpecialTokens,
                decode_special_tokens: decodeSpecialTokensEncode,
            };

            const response = await encodeTokens(
                settings.serverUrl,
                settings.apiKey,
                request
            );

            setEncodedTokens(response.tokens);
            setTokenCount(response.length);
        } catch (err) {
            setError("Failed to encode tokens");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDecode = async () => {
        if (!tokensToDecode.trim()) {
            setError("Please enter tokens to decode");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Parse the tokens from the input string
            let tokens: number[];
            try {
                // Handle different input formats: comma-separated, space-separated, or JSON array
                const cleanedInput = tokensToDecode.replace(/[\[\]]/g, "").trim();
                tokens = cleanedInput.split(/[,\s]+/).map(t => parseInt(t.trim(), 10));
                
                if (tokens.some(isNaN)) {
                    throw new Error("Invalid token format");
                }
            } catch (err) {
                setError("Invalid token format. Please enter comma or space-separated numbers.");
                setLoading(false);
                return;
            }

            const request: TokenDecodeRequest = {
                tokens,
                add_bos_token: addBosTokenDecode,
                encode_special_tokens: encodeSpecialTokensDecode,
                decode_special_tokens: decodeSpecialTokensDecode,
            };

            const response = await decodeTokens(
                settings.serverUrl,
                settings.apiKey,
                request
            );

            setDecodedText(response.text);
        } catch (err) {
            setError("Failed to decode tokens");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Tokenization Tools</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={handleTabChange} aria-label="tokenization tabs">
                        <Tab label="Encode" id="tokenization-tab-0" aria-controls="tokenization-tabpanel-0" />
                        <Tab label="Decode" id="tokenization-tab-1" aria-controls="tokenization-tabpanel-1" />
                    </Tabs>
                </Box>
                
                <TabPanel value={tabValue} index={0}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="Text to Encode"
                                multiline
                                rows={4}
                                fullWidth
                                value={textToEncode}
                                onChange={(e) => setTextToEncode(e.target.value)}
                                placeholder="Enter text to convert to tokens"
                                variant="outlined"
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={addBosTokenEncode}
                                            onChange={(e) => setAddBosTokenEncode(e.target.checked)}
                                        />
                                    }
                                    label="Add BOS Token"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={encodeSpecialTokens}
                                            onChange={(e) => setEncodeSpecialTokens(e.target.checked)}
                                        />
                                    }
                                    label="Encode Special Tokens"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={decodeSpecialTokensEncode}
                                            onChange={(e) => setDecodeSpecialTokensEncode(e.target.checked)}
                                        />
                                    }
                                    label="Decode Special Tokens"
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleEncode}
                                disabled={loading || !textToEncode.trim()}
                            >
                                {loading ? <CircularProgress size={24} /> : "Encode"}
                            </Button>
                        </Grid>
                        
                        {encodedTokens.length > 0 && (
                            <>
                                <Grid item xs={12}>
                                    <Divider />
                                    <Box sx={{ mt: 2, mb: 1 }}>
                                        <Typography variant="subtitle1">
                                            Results: <Chip label={`${tokenCount} tokens`} color="primary" size="small" />
                                        </Typography>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ p: 2, maxHeight: '200px', overflow: 'auto' }}
                                    >
                                        <Typography variant="body2" component="div" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                                            {JSON.stringify(encodedTokens, null, 2)}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ p: 2, maxHeight: '200px', overflow: 'auto' }}
                                    >
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {encodedTokens.map((token, index) => (
                                                <Chip 
                                                    key={index} 
                                                    label={token} 
                                                    size="small" 
                                                    variant="outlined"
                                                    sx={{ fontFamily: 'monospace' }}
                                                />
                                            ))}
                                        </Box>
                                    </Paper>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </TabPanel>
                
                <TabPanel value={tabValue} index={1}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="Tokens to Decode"
                                multiline
                                rows={4}
                                fullWidth
                                value={tokensToDecode}
                                onChange={(e) => setTokensToDecode(e.target.value)}
                                placeholder="Enter tokens as numbers separated by commas or spaces (e.g., 1, 2, 3 or [1, 2, 3])"
                                variant="outlined"
                            />
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={addBosTokenDecode}
                                            onChange={(e) => setAddBosTokenDecode(e.target.checked)}
                                        />
                                    }
                                    label="Add BOS Token"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={encodeSpecialTokensDecode}
                                            onChange={(e) => setEncodeSpecialTokensDecode(e.target.checked)}
                                        />
                                    }
                                    label="Encode Special Tokens"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={decodeSpecialTokensDecode}
                                            onChange={(e) => setDecodeSpecialTokensDecode(e.target.checked)}
                                        />
                                    }
                                    label="Decode Special Tokens"
                                />
                            </Box>
                        </Grid>
                        
                        <Grid item xs={12}>
                            <Button 
                                variant="contained" 
                                color="primary" 
                                onClick={handleDecode}
                                disabled={loading || !tokensToDecode.trim()}
                            >
                                {loading ? <CircularProgress size={24} /> : "Decode"}
                            </Button>
                        </Grid>
                        
                        {decodedText && (
                            <>
                                <Grid item xs={12}>
                                    <Divider />
                                    <Box sx={{ mt: 2, mb: 1 }}>
                                        <Typography variant="subtitle1">
                                            Decoded Text:
                                        </Typography>
                                    </Box>
                                </Grid>
                                
                                <Grid item xs={12}>
                                    <Paper 
                                        variant="outlined" 
                                        sx={{ p: 2, maxHeight: '200px', overflow: 'auto' }}
                                    >
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {decodedText}
                                        </Typography>
                                    </Paper>
                                </Grid>
                            </>
                        )}
                    </Grid>
                </TabPanel>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
