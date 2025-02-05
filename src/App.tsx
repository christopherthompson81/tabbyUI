import * as React from "react";
import {
    useState,
    useEffect,
    useCallback,
    useRef,
    useLayoutEffect,
    useReducer,
} from "react";
import { foldersReducer } from "./reducers/foldersReducer";
import { ModelInfo, getModelInfo } from "./services/tabbyAPI";
import Message from "./Message";
import { MessageProps } from "./services/tabbyAPI";
import {
    getPersistedConversations,
    persistConversations,
    getPersistedCurrentConversationId,
    persistCurrentConversationId,
    getPersistedServerUrl,
    persistServerUrl,
    getPersistedApiKey,
    persistApiKey,
    getPersistedGenerationParams,
    persistGenerationParam,
    persistAdminApiKey,
    getPersistedAdminApiKey,
    Conversation,
    ConversationFolder,
    findConversation,
    findFirstConversation,
} from "./utils/persistence";
import "./styles.css";
import {
    AppBar,
    Box,
    CssBaseline,
    IconButton,
    Menu,
    MenuItem,
    Toolbar,
    Typography,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ChatInput from "./components/ChatInput";
import SettingsDialog from "./components/SettingsDialog";
import AboutDialog from "./components/AboutDialog";
import ModelsDialog from "./components/ModelsDialog";
import { AppDrawer } from "./components/AppDrawer";
import {
    MessageContent,
    sendConversation as sendConversationToAPI,
} from "./services/tabbyAPI";

function App() {
    const [folders, dispatch] = useReducer(foldersReducer, getPersistedConversations());
    const [currentConversationId, setCurrentConversationId] = useState<string>(
        getPersistedCurrentConversationId()
    );
    const [serverUrl, setServerUrl] = useState(getPersistedServerUrl());
    const [apiKey, setApiKey] = useState(getPersistedApiKey());
    const [adminApiKey, setAdminApiKey] = useState(getPersistedAdminApiKey());
    const [generationParams, setGenerationParams] = useState(() =>
        getPersistedGenerationParams()
    );
    const [showSettings, setShowSettings] = useState(
        !Boolean(getPersistedApiKey())
    );
    const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(
        null
    );
    const [showAbout, setShowAbout] = useState(false);
    const [showModels, setShowModels] = useState(false);
    const [serverStatus, setServerStatus] = useState<
        "checking" | "online" | "offline"
    >("checking");
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
    const [originalUserInput, setOriginalUserInput] = useState<
        MessageContent[]
    >([]);
    const [messages, setMessages] = useState<any[]>([]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

    // Smooth-Scrolling
    useLayoutEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    // Bootstrap conversations and periodic status checks
    useEffect(() => {
        let tempConversationId = getPersistedCurrentConversationId();
        if (!tempConversationId) {
            const newId = addNewConversation();
            setMessages([]);
            saveConversation([]);
            tempConversationId = newId;
            setCurrentConversationId(tempConversationId.toString());
            persistCurrentConversationId(tempConversationId.toString());
        } else {
            switchConversation(tempConversationId);
        }
        const checkStatus = async () => {
            setServerStatus("checking");
            const model = await getModelInfo(serverUrl, apiKey);
            if (model) {
                setServerStatus("online");
                setModelInfo(model);
            } else {
                setServerStatus("offline");
                setModelInfo(null);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

        return () => clearInterval(interval);
    }, [serverUrl, apiKey]);

    const saveConversation = useCallback(
        (v: MessageProps[]) => {
            if (currentConversationId !== null) {
                const updatedFolders = folders.map(folder => ({
                    ...folder,
                    conversations: folder.conversations.map(conv =>
                        conv.id === currentConversationId
                            ? { ...conv, messages: v }
                            : conv
                    )
                }));
                dispatch({ type: 'UPDATE_FOLDERS', folders: updatedFolders });
                // Throttle persistence
                setTimeout(() => persistConversations(updatedFolders), 100);
            }
        },
        [currentConversationId, folders]
    );

    const sendConversation = useCallback(
        async (userMessage: MessageContent[], regenerate: boolean = false) => {
            if (!regenerate) {
                setOriginalUserInput([...userMessage]); // Store the original user input
            }

            try {
                await sendConversationToAPI(
                    serverUrl,
                    apiKey,
                    messages,
                    userMessage,
                    regenerate,
                    (updatedMessages) => {
                        setMessages(updatedMessages);
                        scrollToBottom();
                    },
                    (finalMessages) => {
                        saveConversation(finalMessages);
                    }
                );
            } catch (error) {
                console.error("Error sending conversation:", error);
            }
        },
        [messages, serverUrl, apiKey, saveConversation]
    );

    const addNewConversation = (folderId = "root") => {
        const newId = Date.now().toString();
        const newConversationName = new Date().toLocaleString();
        
        dispatch({
            type: 'ADD_CONVERSATION',
            conversation: {
                id: newId,
                name: newConversationName,
                messages: []
            },
            folderId
        });

        setCurrentConversationId(newId);
        return newId;
    };

    const addNewFolder = (parentFolderId = "root") => {
        const newId = Date.now().toString();
        const newFolder: ConversationFolder = {
            id: newId,
            name: "New Folder",
            conversations: [],
            subfolders: [],
            timestamp: Date.now(),
            author: "User",
        };

        dispatch({
            type: 'ADD_FOLDER',
            folder: newFolder,
            parentFolderId
        });
    };

    const findFolder = (
        folders: ConversationFolder[],
        folderId: string
    ): ConversationFolder | undefined => {
        for (const folder of folders) {
            if (folder.id === folderId) return folder;
            const found = findFolder(folder.subfolders, folderId);
            if (found) return found;
        }
        return undefined;
    };

    const switchConversation = (id: string) => {
        const conversation = findConversation(folders, id);
        if (conversation) {
            setCurrentConversationId(id);
            setMessages(conversation.messages);
            persistCurrentConversationId(Number(id));
        }
    };

    const mainMenuClose = () => {
        setMenuAnchorEl(null);
    };

    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar>
                    <IconButton
                        id="main-menu-button"
                        color="inherit"
                        edge="start"
                        sx={{ mr: 2 }}
                        onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Menu
                        id="main-menu"
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl)}
                        onClose={mainMenuClose}
                        MenuListProps={{
                            "aria-labelledby": "main-menu-button",
                        }}
                    >
                        <MenuItem
                            onClick={() => {
                                mainMenuClose();
                                setShowSettings(true);
                            }}
                        >
                            Settings
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                mainMenuClose();
                                setShowModels(true);
                            }}
                        >
                            Models
                        </MenuItem>
                        <MenuItem
                            onClick={() => {
                                mainMenuClose();
                                setShowAbout(true);
                            }}
                        >
                            About
                        </MenuItem>
                    </Menu>
                    <Typography
                        variant="h6"
                        noWrap
                        component="div"
                        sx={{ flexGrow: 1 }}
                    >
                        tabbyUI
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box
                            sx={{
                                width: 10,
                                height: 10,
                                borderRadius: "50%",
                                backgroundColor:
                                    serverStatus === "online"
                                        ? "lime"
                                        : serverStatus === "offline"
                                        ? "red"
                                        : "orange",
                            }}
                        />
                        <Typography variant="caption">
                            {serverStatus === "online"
                                ? `Online (${modelInfo?.id || "Unknown"})`
                                : serverStatus === "offline"
                                ? "Offline"
                                : "Checking..."}
                        </Typography>
                    </Box>
                </Toolbar>
            </AppBar>
            <AppDrawer
                folders={folders}
                currentConversationId={currentConversationId}
                onAddConversation={addNewConversation}
                onSwitchConversation={switchConversation}
                onAddFolder={addNewFolder}
                onUpdateFolders={(updatedFolders) => {
                    dispatch({ type: 'UPDATE_FOLDERS', folders: updatedFolders });
                    persistConversations(updatedFolders);
                }}
                onDelete={(selectedConversationId) => {
                    if (selectedConversationId !== null) {
                        // use the folersReducer here AI!
                        setFolders((prev) => {
                            const updatedFolders = [...prev];
                            const deleteConversation = (
                                folders: ConversationFolder[],
                                id: string
                            ): boolean => {
                                for (const folder of folders) {
                                    const index = folder.conversations.findIndex(
                                        (conv) => conv.id === id
                                    );
                                    if (index !== -1) {
                                        folder.conversations.splice(index, 1);
                                        return true;
                                    }
                                    if (deleteConversation(folder.subfolders, id)) {
                                        return true;
                                    }
                                }
                                return false;
                            };
                            deleteConversation(updatedFolders, selectedConversationId);
                            persistConversations(updatedFolders);

                            if (currentConversationId === selectedConversationId) {
                                const firstConversation = findFirstConversation(updatedFolders);
                                if (firstConversation) {
                                    setCurrentConversationId(firstConversation.id);
                                    setMessages(firstConversation.messages);
                                } else {
                                    setCurrentConversationId("");
                                    setMessages([]);
                                }
                            }
                            return updatedFolders;
                        });
                    }
                }}
            />

                <SettingsDialog
                    open={showSettings}
                    onClose={() => {
                        persistServerUrl(serverUrl);
                        persistApiKey(apiKey);
                        persistAdminApiKey(adminApiKey);
                        Object.entries(generationParams).forEach(
                            ([key, value]) => {
                                persistGenerationParam(key, value.toString());
                            }
                        );
                        setShowSettings(false);
                    }}
                    serverUrl={serverUrl}
                    onServerUrlChange={(e) => setServerUrl(e.target.value)}
                    apiKey={apiKey}
                    onApiKeyChange={(e) => setApiKey(e.target.value)}
                    adminApiKey={adminApiKey}
                    onAdminApiKeyChange={(e) => setAdminApiKey(e.target.value)}
                    generationParams={generationParams}
                    onGenerationParamsChange={useCallback((key, value) => {
                        setGenerationParams((prev) => ({
                            ...prev,
                            [key]: value,
                        }));
                    }, [])}
                />

                <AboutDialog
                    open={showAbout}
                    onClose={() => setShowAbout(false)}
                />
                <ModelsDialog
                    open={showModels}
                    onClose={() => setShowModels(false)}
                    serverUrl={serverUrl}
                    adminApiKey={adminApiKey}
                />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <div className="main-content">
                    {messages.map((message, index) => (
                        <Message
                            key={index}
                            role={message.role}
                            content={message.content}
                            onEdit={(i, newContent) => {
                                const updatedMessages = [...messages];
                                updatedMessages[i].content = newContent;
                                saveConversation(updatedMessages);
                            }}
                            onDelete={(i) => {
                                const updatedMessages = messages.filter(
                                    (_, idx) => idx !== i
                                );
                                saveConversation(updatedMessages);
                            }}
                            index={index}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                <ChatInput
                    onSend={(content: MessageContent[]) => {
                        if (content.length > 0) {
                            sendConversation(content);
                        }
                    }}
                    onRegenerate={() => {
                        if (messages.length > 0) {
                            sendConversation(originalUserInput, true);
                        }
                    }}
                />
            </Box>
        </Box>
    );
}

export default App;
