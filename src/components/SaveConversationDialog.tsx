import * as React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    List,
    ListItem,
    ListItemText,
    Typography,
    Box
} from '@mui/material';
import { exportToMarkdown, exportToDocx, exportToPdf } from '../utils/exportUtils';

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
                    content = await exportToDocx(conversation.messages, options);
                    downloadFile(content, `${conversation.name}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    break;
                case 'pdf':
                    const htmlContent = await exportToPdf(conversation.messages, options);
                    const printWindow = window.open('', '_blank');
                    if (printWindow) {
                        printWindow.document.write(htmlContent);
                        printWindow.document.close();
                        printWindow.print();
                    }
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
                            <ListItem
                                button
                                key={format}
                                onClick={() => handleExport(format)}
                            >
                                <ListItemText
                                    primary={format.toUpperCase()}
                                    secondary={format === 'markdown' ? 'Includes images and formatting' :
                                        format === 'docx' ? 'Microsoft Word format' :
                                            format === 'pdf' ? 'Portable Document Format' :
                                                'Raw data format'}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
            </DialogActions>
        </Dialog>
    );
};
