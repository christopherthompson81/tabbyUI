import {
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
import { MessageProps } from "./services/tabbyAPI";
import {
    ConversationFolder,
    getPersistedConversations,
    getPersistedCurrentConversationId,
    findConversation,
} from "./utils/persistence";
import AppHeader from "./components/AppHeader";
import ChatInput from "./components/ChatInput";
import { AppDrawer } from "./components/AppDrawer";
import Messages from "./components/Messages";

interface ReducerState {
    folders: ConversationFolder[];
    currentConversationId: string;
    messages: MessageProps[];
}

function initializeState(): ReducerState {
    const folders = getPersistedConversations();
    const currentConversationId = getPersistedCurrentConversationId();
    
    if (!currentConversationId) {
        const newId = Date.now().toString();
        const newConversation = {
            id: newId,
            name: new Date().toLocaleString(),
            messages: [],
            timestamp: Date.now(),
            author: "User"
        };
        
        // Add to root folder
        if (folders.length == 0) {
            folders[0].conversations.push(newConversation);
        }
        
        return {
            folders,
            currentConversationId: newId,
            messages: []
        };
    }
    
    const conversation = findConversation(folders, currentConversationId);
    return {
        folders,
        currentConversationId,
        messages: conversation ? conversation.messages : []
    };
}

function App() {
    const [state, dispatch] = useReducer(
        conversationsReducer,
        initializeState()
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

    return (
        <ReducerContext.Provider value={providerState} >
            <Box sx={{ display: "flex" }}>
                <CssBaseline />
                <AppHeader />
                <AppDrawer />
                <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
                    <Messages messagesEndRef={messagesEndRef} />
                    <ChatInput messagesEndRef={messagesEndRef} />
                </Box>
            </Box>
        </ReducerContext.Provider>
    );
}

export default App;
