import { useCallback, useState } from "react";
import {
    TextField,
    Button,
    IconButton,
    Box,
    Chip,
    Stack,
    Tooltip,
} from "@mui/material";
import ImageIcon from "@mui/icons-material/Image";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";
import AdjustIcon from "@mui/icons-material/Adjust";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CodeIcon from "@mui/icons-material/Code";
import Psychology from "@mui/icons-material/Psychology";

// Local Imports
import { useReducerContext } from "../reducers/ReducerContext";
import {
    MessageContent,
    getModelInfo,
    sendConversation as sendConversationToAPI,
} from "../services/tabbyAPI";
import {
    getModelParams,
    getPersistedApiKey,
    getPersistedAdminApiKey,
    getPersistedServerUrl,
} from "../utils/persistence";
//components
import { useModelLoader } from "./ModelLoader";
import ProgressDialog from "./ProgressDialog";
import IconRadioGroup from "./IconRadioGroup";

interface ChatInputProps {
    messagesEndRef: React.MutableRefObject<HTMLDivElement | null>;
}

export default function ChatInput({ messagesEndRef }: ChatInputProps) {
    const { currentConversationId, messages, dispatch } = useReducerContext();
    const [abortController, setAbortController] =
        useState<AbortController | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const serverUrl = getPersistedServerUrl();
    const adminApiKey = getPersistedAdminApiKey();
    const modelLoader = useModelLoader({
        serverUrl,
        adminApiKey,
        onLoadComplete: () => {},
    });
    const [inputText, setInputText] = useState("");
    const [messagePreview, setMessagePreview] = useState<MessageContent[]>([]);
    const [selectedValue, setSelectedValue] = useState("current");

    const scrollToBottom = useCallback(() => {
        if (messagesEndRef.current) {
            // Only scroll if user is near bottom
            const { scrollTop, scrollHeight, clientHeight } =
                document.documentElement;
            if (scrollHeight - (scrollTop + clientHeight) < 100) {
                messagesEndRef.current.scrollIntoView({ behavior: "auto" });
            }
        }
    }, []);

    const sendConversation = useCallback(
        async (userMessage: MessageContent[], regenerate: boolean = false) => {
            try {
                setIsGenerating(true);
                const controller = new AbortController();
                setAbortController(controller);
                await sendConversationToAPI(
                    getPersistedServerUrl(),
                    getPersistedApiKey(),
                    messages,
                    userMessage,
                    regenerate,
                    (updatedMessages) => {
                        dispatch({
                            type: "SET_MESSAGES",
                            messages: updatedMessages,
                        });
                        scrollToBottom();
                    },
                    (finalMessages) => {
                        dispatch({
                            type: "SET_MESSAGES",
                            messages: finalMessages,
                        });
                        if (currentConversationId !== null) {
                            dispatch({
                                type: "UPDATE_CONVERSATION",
                                id: currentConversationId,
                                messages: finalMessages,
                            });
                        }
                        setIsGenerating(false);
                        setAbortController(null);
                    },
                    controller.signal
                );
            } catch (error) {
                console.error("Error sending conversation:", error);
                setIsGenerating(false);
                setAbortController(null);
            }
        },
        [messages]
    );

    const onSend = (content: MessageContent[]) => {
        if (content.length > 0) {
            sendConversation(content);
        }
    };

    const onRegenerate = () => {
        if (messages.length > 0) {
            sendConversation([], true);
        }
    };

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setInputText(e?.target?.value);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        console.log(file);
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target) {
                    const imageUrl: string =
                        event.target.result?.toString() ?? "";
                    const tempMessage: MessageContent = {
                        type: "image_url",
                        image_url: { url: imageUrl },
                    };
                    setMessagePreview((prev) => [...prev, tempMessage]);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAddText = () => {
        if (inputText.trim()) {
            setMessagePreview((prev) => [
                ...prev,
                { type: "text", text: inputText },
            ]);
            setInputText("");
        }
    };

    const handleRemoveItem = (index: number) => {
        setMessagePreview((prev) => prev.filter((_, i) => i !== index));
    };

    const handleRegenerate = async () => {
        // Get model preferences from localStorage
        const modelPreferences = JSON.parse(
            localStorage.getItem("modelPreferences") || "{}"
        );

        // Get selected model ID if not 'current'
        const selectedModel =
            selectedValue !== "current"
                ? modelPreferences[selectedValue]
                : undefined;

        if (selectedModel) {
            // Fetch current model to compare
            const currentModel = await getModelInfo(serverUrl, adminApiKey);

            // If selected model is different from current, load it
            if (currentModel?.id !== selectedModel) {
                const customParams = getModelParams(selectedModel);
                await modelLoader.loadModel(
                    selectedModel,
                    undefined,
                    customParams
                );
            }
        }

        onRegenerate();
    };

    const handleSend = async () => {
        // Get model preferences from localStorage
        const modelPreferences = JSON.parse(
            localStorage.getItem("modelPreferences") || "{}"
        );

        // Get selected model ID if not 'current'
        const selectedModel =
            selectedValue !== "current"
                ? modelPreferences[selectedValue]
                : undefined;

        if (selectedModel) {
            // Fetch current model to compare
            const currentModel = await getModelInfo(serverUrl, adminApiKey);

            // If selected model is different from current, load it
            if (currentModel?.id !== selectedModel) {
                await modelLoader.loadModel(selectedModel);
            }
        }

        // Create temporary preview that includes current input text if any
        const finalPreview: MessageContent[] = inputText.trim()
            ? [...messagePreview, { type: "text", text: inputText.trim() }]
            : messagePreview;

        onSend(finalPreview);
        setInputText("");
        setMessagePreview([]);
    };

    return (
        <div>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {/* Message Preview */}
                {messagePreview.length > 0 && (
                    <Box
                        sx={{
                            p: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            backgroundColor: "background.paper",
                        }}
                    >
                        <Stack direction="column" spacing={1}>
                            {messagePreview.map((item, index) => (
                                <Box key={index} sx={{ position: "relative" }}>
                                    {item.type === "text" && (
                                        <Chip
                                            label={item.text}
                                            onDelete={() =>
                                                handleRemoveItem(index)
                                            }
                                            deleteIcon={<CancelIcon />}
                                            sx={{
                                                maxWidth: "100%",
                                                "& .MuiChip-label": {
                                                    whiteSpace: "normal",
                                                },
                                            }}
                                        />
                                    )}
                                    {item.type === "image_url" &&
                                        item.image_url && (
                                            <Box sx={{ position: "relative" }}>
                                                <img
                                                    src={item.image_url.url}
                                                    alt="Preview"
                                                    style={{
                                                        maxWidth: "100%",
                                                        maxHeight: "200px",
                                                        borderRadius: "4px",
                                                    }}
                                                />
                                                <IconButton
                                                    size="small"
                                                    onClick={() =>
                                                        handleRemoveItem(index)
                                                    }
                                                    sx={{
                                                        position: "absolute",
                                                        right: 4,
                                                        top: 4,
                                                        backgroundColor:
                                                            "background.paper",
                                                    }}
                                                >
                                                    <CancelIcon fontSize="small" />
                                                </IconButton>
                                            </Box>
                                        )}
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* Input Area */}
                <Box sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <TextField
                        label="Enter your message"
                        variant="outlined"
                        fullWidth
                        value={inputText}
                        onChange={handleTextChange}
                        onKeyDown={(e) => {
                            if (
                                e.key === "Enter" &&
                                !e.shiftKey &&
                                inputText.trim()
                            ) {
                                e.preventDefault();
                                handleAddText();
                            }
                        }}
                        multiline
                        minRows={2}
                        maxRows={6}
                    />
                    <Tooltip title="Add Text">
                        <IconButton
                            color="primary"
                            onClick={handleAddText}
                            disabled={!inputText.trim()}
                        >
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                    <input
                        accept="image/*"
                        style={{ display: "none" }}
                        id="icon-button-file"
                        type="file"
                        onChange={handleImageUpload}
                    />
                    <Tooltip title="Add Image">
                        <label htmlFor="icon-button-file">
                            <IconButton color="primary" component="span">
                                <ImageIcon />
                            </IconButton>
                        </label>
                    </Tooltip>
                </Box>

                {/* Action Buttons */}
                <Box
                    sx={{
                        display: "flex",
                        gap: "8px",
                        justifyContent: "flex-end",
                        alignItems: "center",
                    }}
                >
                    <IconRadioGroup
                        value={selectedValue}
                        onChange={(value) => setSelectedValue(value)}
                        options={[
                            {
                                value: "current",
                                tooltip: "Current Model",
                                icon: <AdjustIcon />,
                            },
                            {
                                value: "Assistant",
                                tooltip: "Assistant",
                                icon: <SupportAgentIcon />,
                            },
                            {
                                value: "Vision",
                                tooltip: "Vision Model",
                                icon: <VisibilityIcon />,
                            },
                            {
                                value: "Coding",
                                tooltip: "Coding Model",
                                icon: <CodeIcon />,
                            },
                            {
                                value: "Chain-of-Thought",
                                tooltip: "Reasoning Model",
                                icon: <Psychology />,
                            },
                        ]}
                    />
                    <Box sx={{ alignItems: "center", display: "flex", gap: 1 }}>
                        {isGenerating ? (
                            <Button
                                variant="contained"
                                color="error"
                                onClick={() => abortController?.abort()}
                            >
                                Stop Generating
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="contained"
                                    onClick={handleSend}
                                    disabled={
                                        messagePreview.length === 0 &&
                                        !inputText.trim()
                                    }
                                >
                                    Send
                                </Button>
                                <Button
                                    variant="contained"
                                    onClick={handleRegenerate}
                                >
                                    Regenerate
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>

            <ProgressDialog
                open={!!modelLoader.loadingProgress}
                progress={modelLoader.loadingProgress}
            />
        </div>
    );
}
