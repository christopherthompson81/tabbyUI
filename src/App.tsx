import {
    useRef,
    useLayoutEffect,
    useReducer,
    useMemo,
} from "react";
import "./styles.css";
import {
    Box,
    CssBaseline,
} from "@mui/material";

// Local Imports
import ReducerContext from './reducers/ReducerContext';
import { conversationsReducer } from "./reducers/conversationsReducer";
import { settingsReducer, GenerationParams } from "./reducers/settingsReducer";
import { modelParamsReducer } from "./reducers/modelParamsReducer";
import {
    ConversationFolder,
    findConversation,
    getAllModelParams,
    getPersistedAdminApiKey,
    getPersistedApiKey,
    getPersistedConversations,
    getPersistedCurrentConversationId,
    getPersistedServerUrl,
    getPersistedGenerationParams,
    ModelLoadParams,
    persistConversations,
    persistCurrentConversationId,
} from "./utils/persistence";
import { MessageProps } from "./services/tabbyAPI";
import AppHeader from "./components/AppHeader";
import ChatInput from "./components/ChatInput";
import { AppDrawer } from "./components/AppDrawer";
import Messages from "./components/Messages";


interface ReducerState {
    conversations: {
        folders: ConversationFolder[];
        currentConversationId: string;
        messages: MessageProps[];
    };
    settings: {
        serverUrl: string;
        apiKey: string;
        adminApiKey: string;
        generationParams: GenerationParams;
    };
    modelParams: {
        [modelId: string]: ModelLoadParams;
    };
}

function initializeState(): ReducerState {
    const folders = getPersistedConversations();
    const currentConversationId = getPersistedCurrentConversationId();

    let conversationState;
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
        if (folders.length > 0) {
            folders[0].conversations.push(newConversation);
        }

        // Persist the values using persistence functions
        persistConversations(folders);
        persistCurrentConversationId(parseInt(newId));

        conversationState = {
            folders,
            currentConversationId: newId,
            messages: []
        };
    } else {
        const conversation = findConversation(folders, currentConversationId);
        conversationState = {
            folders,
            currentConversationId,
            messages: conversation ? conversation.messages : []
        };
    }

    return {
        conversations: conversationState,
        settings: {
            serverUrl: getPersistedServerUrl(),
            apiKey: getPersistedApiKey(),
            adminApiKey: getPersistedAdminApiKey(),
            generationParams: getPersistedGenerationParams()
        },
        modelParams: getAllModelParams()
    };
}

function App() {
    const [state, dispatch] = useReducer(
        (state: ReducerState, action: any) => ({
            conversations: conversationsReducer(state.conversations, action),
            settings: settingsReducer(state.settings, action),
            modelParams: modelParamsReducer(state.modelParams, action)
        }),
        initializeState()
    );

    const providerState = useMemo(() => ({
        folders: state.conversations.folders,
        currentConversationId: state.conversations.currentConversationId,
        messages: state.conversations.messages,
        settings: state.settings,
        modelParams: state.modelParams,
        dispatch
    }), [state]);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    // Smooth-Scrolling
    useLayoutEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [state.conversations.messages]);

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
