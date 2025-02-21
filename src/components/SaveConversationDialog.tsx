import * as React from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box,
    Typography,
    Paper,
} from "@mui/material";

interface SaveConversationDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (format: string) => void;
    conversation: {
        name: string;
        messages: any[];
    };
}

export const SaveConversationDialog: React.FC<SaveConversationDialogProps> = ({
    open,
    onClose,
    onSave,
    conversation,
}) => {
    const [selectedFormat, setSelectedFormat] = React.useState("json");

    const getPreview = () => {
        switch (selectedFormat) {
            case "json":
                return JSON.stringify(conversation, null, 2);
            case "txt":
                return conversation.messages
                    .map(
                        (msg) =>
                            `${msg.role}: ${msg.content
                                .map((c: any) => c.text)
                                .join("\n")}`
                    )
                    .join("\n\n");
            case "md":
                return (
                    `# ${conversation.name}\n\n` +
                    conversation.messages
                        .map(
                            (msg) =>
                                `**${msg.role}**:\n${msg.content
                                    .map((c: any) => c.text)
                                    .join("\n")}`
                        )
                        .join("\n\n")
                );
            default:
                return "";
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Save Conversation</DialogTitle>
            <DialogContent>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" gutterBottom>
                        Export Format
                    </Typography>
                    <RadioGroup
                        row
                        value={selectedFormat}
                        onChange={(e) => setSelectedFormat(e.target.value)}
                    >
                        <FormControlLabel
                            value="json"
                            control={<Radio />}
                            label="JSON"
                        />
                        <FormControlLabel
                            value="txt"
                            control={<Radio />}
                            label="Plain Text"
                        />
                        <FormControlLabel
                            value="md"
                            control={<Radio />}
                            label="Markdown"
                        />
                        <FormControlLabel
                            value="pdf"
                            control={<Radio />}
                            label="PDF"
                        />
                    </RadioGroup>
                </Box>

                {selectedFormat !== "pdf" && (
                    <>
                        <Typography variant="subtitle1" gutterBottom>
                            Preview
                        </Typography>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                maxHeight: "300px",
                                overflow: "auto",
                                fontFamily: "monospace",
                                whiteSpace: "pre-wrap",
                            }}
                        >
                            {getPreview()}
                        </Paper>
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancel</Button>
                <Button
                    onClick={() => onSave(selectedFormat)}
                    variant="contained"
                    color="primary"
                >
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    );
};
