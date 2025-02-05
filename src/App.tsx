import * as React from "react";
import {
    useState,
    useEffect,
    useCallback,
    useRef,
    useLayoutEffect,
    useReducer,
} from "react";
import "./styles.css";
import {
    Box,
    CssBaseline,
} from "@mui/material";
import AppHeader from "./components/AppHeader";

// Local Imports
import Message from "./Message";
import { foldersReducer } from "./reducers/foldersReducer";
import {
    MessageContent,
    sendConversation as sendConversationToAPI,
    MessageProps,
    ModelInfo,
    getModelInfo,
} from "./services/tabbyAPI";
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
    findConversation,
    findFirstConversation,
} from "./utils/persistence";
import ChatInput from "./components/ChatInput";
import SettingsDialog from "./components/SettingsDialog";
import AboutDialog from "./components/AboutDialog";
import ModelsDialog from "./components/ModelsDialog";
import { AppDrawer } from "./components/AppDrawer";

function App() {
    const [folders, dispatch] = useReducer(
        foldersReducer,
        getPersistedConversations()
    );
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
                const updatedFolders = folders.map((folder) => ({
                    ...folder,
                    conversations: folder.conversations.map((conv) =>
                        conv.id === currentConversationId
                            ? { ...conv, messages: v }
                            : conv
                    ),
                }));
                dispatch({ type: "UPDATE_FOLDERS", folders: updatedFolders });
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
            type: "ADD_CONVERSATION",
            conversation: {
                id: newId,
                name: newConversationName,
                messages: [],
            },
            folderId,
        });
        persistConversations(folders);
        setCurrentConversationId(newId);
        return newId;
    };

    const switchConversation = (id: string) => {
        const conversation = findConversation(folders, id);
        if (conversation) {
            setCurrentConversationId(id);
            setMessages(conversation.messages);
            persistCurrentConversationId(Number(id));
        }
    };


    return (
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppHeader
                serverStatus={serverStatus}
                modelInfo={modelInfo}
                onShowSettings={() => setShowSettings(true)}
                onShowModels={() => setShowModels(true)}
                onShowAbout={() => setShowAbout(true)}
            />
            <AppDrawer
                currentConversationId={currentConversationId}
                onAddConversation={addNewConversation}
                onSwitchConversation={switchConversation}
                onUpdateFolders={(updatedFolders) => {
                    dispatch({
                        type: "UPDATE_FOLDERS",
                        folders: updatedFolders,
                    });
                    persistConversations(updatedFolders);
                }}
                onDelete={(selectedConversationId) => {
                    if (selectedConversationId !== null) {
                        dispatch({
                            type: "DELETE_CONVERSATION",
                            id: selectedConversationId,
                        });
                        if (currentConversationId === selectedConversationId) {
                            const firstConversation =
                                findFirstConversation(folders);
                            if (firstConversation) {
                                setCurrentConversationId(firstConversation.id);
                                setMessages(firstConversation.messages);
                            } else {
                                setCurrentConversationId("");
                                setMessages([]);
                            }
                        }
                    }
                }}
            />

            <SettingsDialog
                open={showSettings}
                onClose={() => {
                    persistServerUrl(serverUrl);
                    persistApiKey(apiKey);
                    persistAdminApiKey(adminApiKey);
                    Object.entries(generationParams).forEach(([key, value]) => {
                        persistGenerationParam(key, value.toString());
                    });
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
            <ModelsDialog
                open={showModels}
                onClose={() => setShowModels(false)}
                serverUrl={serverUrl}
                adminApiKey={adminApiKey}
            />
            <AboutDialog open={showAbout} onClose={() => setShowAbout(false)} />

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
