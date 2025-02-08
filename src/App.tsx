import {
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
import ReducerContext from './reducers/ReducerContext';
import { conversationsReducer } from "./reducers/conversationsReducer";
import {
    MessageContent,
    sendConversation as sendConversationToAPI,
    MessageProps,
} from "./services/tabbyAPI";
import {
    ConversationFolder,
    getPersistedConversations,
    getPersistedCurrentConversationId,
    getPersistedServerUrl,
    getPersistedApiKey,
    findConversation,
} from "./utils/persistence";
import AppHeader from "./components/AppHeader";
import ChatInput from "./components/ChatInput";
import { AppDrawer } from "./components/AppDrawer";
import Messages from "./components/Messages";

function getMessages(id: string, folders: ConversationFolder[]) {
    const conversation = findConversation(folders, id);
    return conversation ? conversation.messages : [];
}

function App() {
    const [state, dispatch] = useReducer(
        conversationsReducer,
        {
            folders: getPersistedConversations(),
            currentConversationId: getPersistedCurrentConversationId(),
            messages: getMessages(getPersistedCurrentConversationId(), getPersistedConversations())
        }
    );
    const providerState = {
        folders: state.folders,
        currentConversationId: state.currentConversationId,
        messages: state.messages,
        dispatch
    }
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

    // Bootstrap conversations
    // Things will happen repeatedly with this. It should probably be in the reducer code.
    useEffect(() => {
        if (!state.currentConversationId) {
            const tempConversationId = addNewConversation();
            dispatch({ type: 'SET_MESSAGES', messages: [] });
            dispatch({ type: "SET_CURRENT_CONVERSATION", id: tempConversationId.toString() });
            saveConversation([]);
        }
    }, [state.currentConversationId]);

    const saveConversation = useCallback(
        (v: MessageProps[]) => {
            if (state.currentConversationId !== null) {
                dispatch({ type: "UPDATE_CONVERSATION", id: state.currentConversationId, messages: v });
            }
        },
        [state]
    );

    const sendConversation = useCallback(
        async (userMessage: MessageContent[], regenerate: boolean = false) => {
            try {
                await sendConversationToAPI(
                    getPersistedServerUrl(),
                    getPersistedApiKey(),
                    state.messages,
                    userMessage,
                    regenerate,
                    (updatedMessages) => {
                        dispatch({ type: 'SET_MESSAGES', messages: updatedMessages });
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
        }
    };

    // move the "main-content" div to it's own component, Messages. AI!
    return (
        <ReducerContext.Provider value={providerState} >
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <AppHeader />
                <AppDrawer
                    onAddConversation={addNewConversation}
                    onSwitchConversation={switchConversation}
                />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Messages
                        messages={state.messages}
                        messagesEndRef={messagesEndRef}
                        onEditMessage={(index, newContent) => {
                            const updatedMessages = [...state.messages];
                            updatedMessages[index].content = newContent;
                            saveConversation(updatedMessages);
                        }}
                        onDeleteMessage={(index) => {
                            const updatedMessages = state.messages.filter(
                                (_, idx) => idx !== index
                            );
                            saveConversation(updatedMessages);
                        }}
                    />

                    <ChatInput
                        onSend={(content: MessageContent[]) => {
                            if (content.length > 0) {
                                sendConversation(content);
                            }
                        }}
                        onRegenerate={() => {
                            if (state.messages.length > 0) {
                                sendConversation([], true);
                            }
                        }}
                    />
                </Box>
            </Box>
        </ReducerContext.Provider>
    );
}

export default App;
