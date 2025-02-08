import {
    useEffect,
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
    getPersistedConversations,
    getPersistedCurrentConversationId,
    findConversation,
} from "./utils/persistence";
import AppHeader from "./components/AppHeader";
import ChatInput from "./components/ChatInput";
import { AppDrawer } from "./components/AppDrawer";
import Messages from "./components/Messages";

function getMessages() {
    const id = getPersistedCurrentConversationId();
    const folders = getPersistedConversations();
    const conversation = findConversation(folders, id);
    return conversation ? conversation.messages : [];
}

function App() {
    const [state, dispatch] = useReducer(
        conversationsReducer,
        {
            folders: getPersistedConversations(),
            currentConversationId: getPersistedCurrentConversationId(),
            messages: getMessages()
        }
    );
    const providerState = {
        folders: state.folders,
        currentConversationId: state.currentConversationId,
        messages: state.messages,
        dispatch
    }
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

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
            dispatch({ type: "UPDATE_CONVERSATION", id: tempConversationId.toString(), messages: [] });
        }
    }, [state.currentConversationId]);

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
                    <Messages messagesEndRef={messagesEndRef} />
                    <ChatInput messagesEndRef={messagesEndRef} />
                </Box>
            </Box>
        </ReducerContext.Provider>
    );
}

export default App;
