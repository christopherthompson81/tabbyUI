import {
    Dialog,
    DialogTitle,
    DialogContent,
    Typography,
    IconButton,
    Box,
    Tabs,
    Tab,
    Paper,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useState } from "react";
import HelpIntroduction from "./HelpIntroducxtion";

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
            id={`help-tabpanel-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

interface HelpDialogProps {
    open: boolean;
    onClose: () => void;
}

export default function HelpDialog({ open, onClose }: HelpDialogProps) {
    const [tabValue, setTabValue] = useState(0);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="lg"
            fullWidth
            fullScreen
        >
            <DialogTitle>
                Help & Documentation
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)}>
                        <Tab label="Introduction" />
                        <Tab label="Getting Started" />
                        <Tab label="Hardware Requirements" />
                        <Tab label="Use Cases" />
                    </Tabs>
                </Box>

                <TabPanel value={tabValue} index={0}>
                    <HelpIntroduction />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <Typography variant="h6" gutterBottom>Setting Up Your Environment</Typography>
                    
                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">1. Python Setup</Typography>
                        <Typography paragraph>
                            • Install Python 3.10 or newer<br/>
                            • Create a virtual environment (recommended)<br/>
                            • Install required Python packages
                        </Typography>
                    </Paper>

                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">2. Install ExLlamaV2</Typography>
                        <Typography paragraph>
                            • Clone the ExLlamaV2 repository<br/>
                            • Install dependencies<br/>
                            • Build the required CUDA extensions
                        </Typography>
                    </Paper>

                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">3. Install and Configure TabbyAPI</Typography>
                        <Typography paragraph>
                            • Install TabbyAPI using pip<br/>
                            • Configure the server settings<br/>
                            • Set up API keys and access controls
                        </Typography>
                    </Paper>

                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">4. Model Management</Typography>
                        <Typography paragraph>
                            • Download models from Hugging Face using TabbyAPI<br/>
                            • Configure model parameters<br/>
                            • Optimize for your hardware
                        </Typography>
                    </Paper>
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <Typography variant="h6" gutterBottom>Hardware Requirements</Typography>
                    
                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Minimum Requirements</Typography>
                        <Typography paragraph>
                            • NVIDIA GPU with 8GB VRAM<br/>
                            • 16GB System RAM<br/>
                            • CUDA 11.7 or newer
                        </Typography>
                    </Paper>

                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Recommended Setup</Typography>
                        <Typography paragraph>
                            • NVIDIA GPU with 24GB+ VRAM<br/>
                            • 32GB+ System RAM<br/>
                            • NVMe SSD for model storage
                        </Typography>
                    </Paper>

                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Multi-GPU Configurations</Typography>
                        <Typography paragraph>
                            • Setting up tensor parallelism<br/>
                            • Memory management across GPUs<br/>
                            • Performance optimization tips
                        </Typography>
                    </Paper>
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <Typography variant="h6" gutterBottom>Common Use Cases</Typography>

                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Development Assistant</Typography>
                        <Typography paragraph>
                            • Using with Aider for code assistance<br/>
                            • Code review and suggestions<br/>
                            • Documentation generation
                        </Typography>
                    </Paper>

                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Document Analysis</Typography>
                        <Typography paragraph>
                            • OCR with vision-language models<br/>
                            • Processing scanned documents<br/>
                            • Extracting information from images
                        </Typography>
                    </Paper>

                    <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                        <Typography variant="h6">Creative Writing</Typography>
                        <Typography paragraph>
                            • Story development<br/>
                            • Content generation<br/>
                            • Editorial assistance
                        </Typography>
                    </Paper>
                </TabPanel>
            </DialogContent>
        </Dialog>
    );
}
