import * as React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    Radio,
    RadioGroup,
    FormControlLabel,
    Typography,
    Box
} from '@mui/material';
import { exportToMarkdown, exportToDocx } from '../utils/exportUtils';
import { exportToPdf } from './PdfExport';

interface SaveConversationDialogProps {
    open: boolean;
    onClose: () => void;
    conversation: {
        name: string;
        messages: any[];
    };
}
export const SaveConversationDialog: React.FC<SaveConversationDialogProps> = ({
    open,
    onClose,
    conversation
}) => {
    const formats = ['markdown', 'json', 'docx', 'pdf'];
    const [selectedFormat, setSelectedFormat] = React.useState('markdown');

    const handleExport = async (format: string) => {
        try {
            let content: string | Buffer;
            const options = {
                title: conversation.name,
                date: new Date().toLocaleDateString()
            };

            switch (format) {
                case 'markdown':
                    content = await exportToMarkdown(conversation.messages, options);
                    downloadFile(content, `${conversation.name}.md`, 'text/markdown');
                    break;
                case 'json':
                    content = JSON.stringify(conversation, null, 2);
                    downloadFile(content, `${conversation.name}.json`, 'application/json');
                    break;
                case 'docx':
                    const docxBlob = await exportToDocx(conversation.messages, options);
                    const url = URL.createObjectURL(docxBlob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${conversation.name}.docx`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                    break;
                case 'pdf':
                    await exportToPdf(conversation.messages, options);
                    break;
            }
            onClose();
        } catch (error) {
            console.error('Export failed:', error);
        }
    };

    const downloadFile = (content: string | Buffer, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Save Conversation</DialogTitle>
            <DialogContent>
                <Box sx={{ width: '100%' }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Choose Export Format
                    </Typography>
                    <List>
                        {formats.map((format) => (
                            <ListItem key={format}>
                                <RadioGroup
                                    value={selectedFormat}
                                    onChange={(e) => setSelectedFormat(e.target.value)}
                                >
                                    <FormControlLabel
                                        value={format}
                                        control={<Radio />}
                                        label={
                                            <Box>
                                                <Typography variant="body1">
                                                    {format.toUpperCase()}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary">
                                                    {format === 'markdown' ? 'Includes images and formatting' :
                                                     format === 'docx' ? 'Microsoft Word format' :
                                                     format === 'pdf' ? 'Portable Document Format' :
                                                     'Raw data format'}
                                                </Typography>
                                            </Box>
                                        }
                                    />
                                </RadioGroup>
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button 
                    onClick={() => handleExport(selectedFormat)}
                    variant="contained" 
                    color="primary"
                >
                    Download
                </Button>
            </DialogActions>
        </Dialog>
    );
};
