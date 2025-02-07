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

// Local Imports
import Message from "./Message";
import ReducerContext from './reducers/ReducerContext';
import { conversationsReducer } from "./reducers/conversationsReducer";
import {
    MessageContent,
    sendConversation as sendConversationToAPI,
    MessageProps,
} from "./services/tabbyAPI";
import {
    getPersistedConversations,
    persistConversations,
    getPersistedCurrentConversationId,
    persistCurrentConversationId,
    getPersistedServerUrl,
    getPersistedApiKey,
    findConversation,
    findFirstConversation,
} from "./utils/persistence";
import AppHeader from "./components/AppHeader";
import ChatInput from "./components/ChatInput";
import { AppDrawer } from "./components/AppDrawer";

function App() {
    const [state, dispatch] = useReducer(
        conversationsReducer,
        {
            folders: getPersistedConversations(),
            currentConversationId: getPersistedCurrentConversationId(),
            messages: []
        }
    );
    const providerState = {
        folders: state.folders,
        currentConversationId: state.currentConversationId,
        messages: state.messages,
        dispatch
    }
    const [originalUserInput, setOriginalUserInput] = useState<MessageContent[]>([]);
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
    }, [state.messages]);

    // Bootstrap conversations and periodic status checks
    useEffect(() => {
        let tempConversationId = state.currentConversationId;
        if (!tempConversationId) {
            const newId = addNewConversation();
            dispatch({ type: 'SET_MESSAGES', messages: [] });
            saveConversation([]);
            tempConversationId = newId;
            dispatch({ type: "SET_CURRENT_CONVERSATION", id: tempConversationId.toString() });
        } else {
            switchConversation(tempConversationId);
        }
    }, []);

    const saveConversation = useCallback(
        (v: MessageProps[]) => {
            if (state.currentConversationId !== null) {
                const updateConversationsInFolder = (folder: typeof state.folders[0]): typeof state.folders[0] => ({
                    ...folder,
                    conversations: folder.conversations.map(conv =>
                        conv.id === state.currentConversationId
                            ? { ...conv, messages: v }
                            : conv
                    ),
                    subfolders: folder.subfolders.map(updateConversationsInFolder)
                });

                const updatedFolders = state.folders.map(updateConversationsInFolder);
                dispatch({ type: "UPDATE_FOLDERS", folders: updatedFolders });
                // Throttle persistence
                //setTimeout(() => persistConversations(updatedFolders), 100);
            }
        },
        [state]
    );

    const sendConversation = useCallback(
        async (userMessage: MessageContent[], regenerate: boolean = false) => {
            if (!regenerate) {
                setOriginalUserInput([...userMessage]); // Store the original user input
            }

            try {
                await sendConversationToAPI(
                    getPersistedServerUrl(),
                    getPersistedApiKey(),
                    state.messages,
                    userMessage,
                    regenerate,
                    (updatedMessages) => {
                        dispatch({ type: 'SET_MESSAGES', messages: updatedMessages });
                        saveConversation(updatedMessages);
                        scrollToBottom();
                    },
                    (finalMessages) => {
                        dispatch({ type: 'SET_MESSAGES', messages: finalMessages });
                        saveConversation(finalMessages);
                    }
                );
            } catch (error) {
                console.error("Error sending conversation:", error);
            }
        },
        [state.messages, saveConversation]
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
        dispatch({ type: 'SET_CURRENT_CONVERSATION', id: newId });
        return newId;
    };

    const switchConversation = (id: string) => {
        const conversation = findConversation(state.folders, id);
        if (conversation) {
            dispatch({ type: 'SET_CURRENT_CONVERSATION', id });
            dispatch({ type: 'SET_MESSAGES', messages: conversation.messages });
            persistCurrentConversationId(Number(id));
        }
    };

    return (
        <ReducerContext.Provider value={providerState} >
        <Box sx={{ display: "flex" }}>
            <CssBaseline />
            <AppHeader />
            <AppDrawer
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
                        if (state.currentConversationId === selectedConversationId) {
                            const firstConversation =
                                findFirstConversation(state.folders);
                            if (firstConversation) {
                                dispatch({ type: 'SET_CURRENT_CONVERSATION', id: firstConversation.id });
                                dispatch({ type: 'SET_MESSAGES', messages: firstConversation.messages });
                            } else {
                                dispatch({ type: 'SET_CURRENT_CONVERSATION', id: "" });
                                dispatch({ type: 'SET_MESSAGES', messages: [] });
                            }
                        }
                    }
                }}
            />
            <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                <div className="main-content">
                    {state.messages.map((message, index) => (
                        <Message
                            key={index}
                            role={message.role}
                            content={message.content}
                            onEdit={(i, newContent) => {
                                const updatedMessages = [...state.messages];
                                updatedMessages[i].content = newContent;
                                saveConversation(updatedMessages);
                            }}
                            onDelete={(i) => {
                                const updatedMessages = state.messages.filter(
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
                        if (state.messages.length > 0) {
                            sendConversation(originalUserInput, true);
                        }
                    }}
                />
            </Box>
        </Box>
        </ReducerContext.Provider>
    );
}

export default App;
