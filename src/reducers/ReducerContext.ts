import * as React from "react";
import { ConversationFolder } from "../utils/persistence";
import { ConversationsAction } from "./conversationsReducer";

interface ReducerContextType {
    folders: ConversationFolder[];
    currentConversationId: string;
    dispatch: React.Dispatch<ConversationsAction>;
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
