import { useState } from "react";
import ConversationList from "./ConversationList";
import ConversationEditor from "./ConversationEditor";
import FolderEditor from "./FolderEditor";
import {
    ConversationFolder,
    findConversation,
    findFirstConversation,
} from "../utils/persistence";
import { ChangeEvent } from "react";
import { Drawer } from "@mui/material";
import { useReducerContext } from "../reducers/ReducerContext";

interface AppDrawerProps {
    onAddConversation: (folderId?: string) => void;
    onSwitchConversation: (id: string) => void;
}

function findFolder(
    folders: ConversationFolder[],
    folderId: string
): ConversationFolder | undefined {
    for (const folder of folders) {
        if (folder.id === folderId) return folder;
        const found = findFolder(folder.subfolders, folderId);
        if (found) return found;
    }
    return undefined;
}

export function AppDrawer({
    onAddConversation,
    onSwitchConversation,
}: AppDrawerProps) {
    const { folders, currentConversationId, dispatch } = useReducerContext();
    const [editingConversationId, setEditingConversationId] = useState<
        string | null
    >(null);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [newConversationName, setNewConversationName] = useState("");
    const [newFolderName, setNewFolderName] = useState("");

    const onEditConversation = (id: string) => {
        setEditingConversationId(id);
        const conversation = findConversation(folders, id);
        if (conversation) {
            setNewConversationName(conversation.name);
        }
    };

    const onEditFolder = (id: string) => {
        setEditingFolderId(id);
        const folder = findFolder(folders, id);
        if (folder) {
            setNewFolderName(folder.name);
        }
    };

    const onSaveFolder = () => {
        if (editingFolderId !== null) {
            dispatch({
                type: "UPDATE_FOLDERS",
                folders: folders.map((folder) => {
                    if (folder.id === editingFolderId) {
                        return { ...folder, name: newFolderName };
                    }
                    return folder;
                }),
            });
            setEditingFolderId(null);
        }
    };

    const onUpdateFolders = (updatedFolders: ConversationFolder[]) => {
        dispatch({
            type: "UPDATE_FOLDERS",
            folders: updatedFolders,
        });
    }

    const onDeleteFolder = () => {
        if (editingFolderId !== null) {
            dispatch({
                type: "UPDATE_FOLDERS",
                folders: folders.filter(
                    (folder) => folder.id !== editingFolderId
                ),
            });
            setEditingFolderId(null);
        }
    };

    const onDeleteConversation = (selectedConversationId: string) => {
        if (selectedConversationId !== null) {
            dispatch({
                type: "DELETE_CONVERSATION",
                id: selectedConversationId,
            });
            if (currentConversationId === selectedConversationId) {
                const firstConversation =
                    findFirstConversation(folders);
                if (firstConversation) {
                    dispatch({ type: 'SET_CURRENT_CONVERSATION', id: firstConversation.id });
                    dispatch({ type: 'SET_MESSAGES', messages: firstConversation.messages });
                } else {
                    dispatch({ type: 'SET_CURRENT_CONVERSATION', id: "" });
                    dispatch({ type: 'SET_MESSAGES', messages: [] });
                }
            }
        }
    };

    const onSaveConversation = () => {
        if (editingConversationId !== null) {
            dispatch({
                type: "UPDATE_FOLDERS",
                folders: folders.map((folder) => ({
                    ...folder,
                    conversations: folder.conversations.map((conv) =>
                        conv.id === editingConversationId
                            ? { ...conv, name: newConversationName }
                            : conv
                    ),
                })),
            });
            setEditingConversationId(null);
        }
    };

    const addNewFolder = (parentFolderId = "root") => {
        const newId = Date.now().toString();
        const newFolder: ConversationFolder = {
            id: newId,
            name: "New Folder",
            conversations: [],
            subfolders: [],
            timestamp: Date.now(),
            author: "User",
        };

        dispatch({
            type: "ADD_FOLDER",
            folder: newFolder,
            parentFolderId,
        });
    };

    return (
        <Drawer
            variant="permanent"
            anchor="left"
            sx={{
                width: 240,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                    width: 240,
                    boxSizing: "border-box",
                },
            }}
        >
            <ConversationList
                folders={folders}
                currentConversationId={currentConversationId}
                onAddConversation={onAddConversation}
                onSwitchConversation={onSwitchConversation}
                onEditConversation={onEditConversation}
                onAddFolder={addNewFolder}
                onEditFolder={onEditFolder}
                onDelete={onDeleteConversation}
            />

            <FolderEditor
                editingFolderId={editingFolderId}
                newFolderName={newFolderName}
                onNameChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewFolderName(e.target.value)
                }
                onSave={onSaveFolder}
                onDelete={onDeleteFolder}
                onCancel={() => setEditingFolderId(null)}
            />
            <ConversationEditor
                editingConversationId={editingConversationId}
                newConversationName={newConversationName}
                onNameChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewConversationName(e.target.value)
                }
                onSave={onSaveConversation}
                onCancel={() => setEditingConversationId(null)}
            />
        </Drawer>
    );
}
