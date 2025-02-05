import { ConversationFolder } from "../utils/persistence";

export type FoldersAction = 
  | { type: 'SET_FOLDERS'; folders: ConversationFolder[] }
  | { type: 'UPDATE_FOLDERS'; folders: ConversationFolder[] }
  | { type: 'DELETE_CONVERSATION'; id: string }
  | { type: 'ADD_CONVERSATION'; conversation: { id: string, name: string, messages: any[] }, folderId: string }
  | { type: 'ADD_FOLDER'; folder: ConversationFolder, parentFolderId: string };

export function foldersReducer(state: ConversationFolder[], action: FoldersAction): ConversationFolder[] {
    switch (action.type) {
        case 'SET_FOLDERS':
        case 'UPDATE_FOLDERS':
            return action.folders;
            
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
            return deleteConversation(state, action.id);
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
            return addConversation(state, action.folderId);
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
            return addFolder(state, action.parentFolderId);
        }

        default:
            return state;
    }
}
