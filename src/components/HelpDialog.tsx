import {
    Dialog,
    DialogTitle,
    DialogContent,
    IconButton,
    Box,
    Tabs,
    Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState } from "react";
import LLMOutputRenderer from "./LLMOutputRenderer";

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
    const [helpIntroduction, setHelpIntroduction] = useState<string>('');
    const [helpGettingStarted, setHelpGettingStarted] = useState<string>('');
    const [helpHardwareAndRequirements, setHelpHardwareAndRequirements] = useState<string>('');
    const [helpUseCases, setHelpUseCases] = useState<string>('');
    
    useEffect(() => {
        fetch('/documentation/Introduction.md')
            .then((res) => res.text())
            .then((text) => setHelpIntroduction(text));
        fetch('/documentation/GettingStarted.md')
            .then((res) => res.text())
            .then((text) => setHelpGettingStarted(text));
        fetch('/documentation/HardwareAndRequirements.md')
            .then((res) => res.text())
            .then((text) => setHelpHardwareAndRequirements(text));
        fetch('/documentation/UseCases.md')
            .then((res) => res.text())
            .then((text) => setHelpUseCases(text));
    },[]);

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
                    <LLMOutputRenderer content={helpIntroduction} />
                </TabPanel>

                <TabPanel value={tabValue} index={1}>
                    <LLMOutputRenderer content={helpGettingStarted} />
                </TabPanel>

                <TabPanel value={tabValue} index={2}>
                    <LLMOutputRenderer content={helpHardwareAndRequirements} />
                </TabPanel>

                <TabPanel value={tabValue} index={3}>
                    <LLMOutputRenderer content={helpUseCases} />
                </TabPanel>
            </DialogContent>
        </Dialog>
    );
}
