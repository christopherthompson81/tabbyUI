import * as React from "react";
import { ConversationFolder } from "../utils/persistence";
import { ConversationsAction } from "./conversationsReducer";
import { MessageProps } from "../services/tabbyAPI";
import { SettingsAction } from "./settingsReducer";
import { GenerationParams } from "../components/SettingsDialog";

interface ReducerContextType {
    folders: ConversationFolder[];
    currentConversationId: string;
    messages: MessageProps[];
    settings: {
        serverUrl: string;
        apiKey: string;
        adminApiKey: string;
        generationParams: GenerationParams;
    };
    dispatch: React.Dispatch<ConversationsAction | SettingsAction>;
}

const ReducerContext = React.createContext<ReducerContextType | undefined>(undefined);

export function useReducerContext() {
    const context = React.useContext(ReducerContext);
    if (context === undefined) {
        throw new Error('useReducerContext must be used within a ReducerProvider');
    }
    return context;
}

export default ReducerContext;
