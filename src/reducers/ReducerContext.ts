import * as React from "react";
import { ConversationFolder } from "../utils/persistence";
import { FoldersAction } from "./foldersReducer";

interface ReducerContextType {
    folders: ConversationFolder[];
    currentConversationId: string;
    dispatch: React.Dispatch<FoldersAction>;
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
