import { ConversationFolder, persistConversations, persistCurrentConversationId } from "../utils/persistence";

export interface ConversationsState {
    folders: ConversationFolder[];
    currentConversationId: string;
}

export type ConversationsAction =
    | { type: 'SET_CURRENT_CONVERSATION'; id: string }
    | { type: 'SET_FOLDERS'; folders: ConversationFolder[] }
    | { type: 'UPDATE_FOLDERS'; folders: ConversationFolder[] }
    | { type: 'DELETE_CONVERSATION'; id: string }
    | { type: 'ADD_CONVERSATION'; conversation: { id: string, name: string, messages: any[] }, folderId: string }
    | { type: 'ADD_FOLDER'; folder: ConversationFolder, parentFolderId: string };

export function conversationsReducer(state: ConversationsState, action: ConversationsAction): ConversationsState {
    switch (action.type) {
        case 'SET_FOLDERS':
        case 'UPDATE_FOLDERS': {
            persistConversations(action.folders);
            return {
                ...state,
                folders: action.folders
            };
        }
        case 'DELETE_CONVERSATION': {
            const deleteConversation = (
                folders: ConversationFolder[],
                id: string
            ): ConversationFolder[] => {
                return folders.map(folder => ({
                    ...folder,
                    conversations: folder.conversations.filter(conv => conv.id !== id),
                    subfolders: deleteConversation(folder.subfolders, id)
                }));
            };
            const newFolders = deleteConversation(state.folders, action.id);
            const newState = { ...state, folders: newFolders };
            persistConversations(newState.folders);
            return newState;
        }

        case 'ADD_CONVERSATION': {
            const addConversation = (
                folders: ConversationFolder[],
                folderId: string
            ): ConversationFolder[] => {
                return folders.map(folder => {
                    if (folder.id === folderId) {
                        return {
                            ...folder,
                            conversations: [...folder.conversations, {
                                id: action.conversation.id,
                                name: action.conversation.name,
                                messages: action.conversation.messages,
                                timestamp: Date.now(),
                                author: "User"
                            }]
                        };
                    }
                    return {
                        ...folder,
                        subfolders: addConversation(folder.subfolders, folderId)
                    };
                });
            };
            const newFolders = addConversation(state.folders, action.folderId);
            const newState = { ...state, folders: newFolders };
            persistConversations(newState.folders);
            return newState;
        }

        case 'ADD_FOLDER': {
            const addFolder = (
                folders: ConversationFolder[],
                parentFolderId: string
            ): ConversationFolder[] => {
                return folders.map(folder => {
                    if (folder.id === parentFolderId) {
                        return {
                            ...folder,
                            subfolders: [...folder.subfolders, action.folder]
                        };
                    }
                    return {
                        ...folder,
                        subfolders: addFolder(folder.subfolders, parentFolderId)
                    };
                });
            };
            const newFolders = addFolder(state.folders, action.parentFolderId);
            const newState = { ...state, folders: newFolders };
            persistConversations(newState.folders);
            return newState;
        }

        case 'SET_CURRENT_CONVERSATION': {
            persistCurrentConversationId(Number(action.id));
            return {
                ...state,
                currentConversationId: action.id
            };
        }

        default:
            return state;
    }
}
