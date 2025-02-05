import { useState } from "react";
import ConversationList from "./ConversationList";
import ConversationEditor from "./ConversationEditor";
import FolderEditor from "./FolderEditor";
import { ConversationFolder, findConversation } from "../utils/persistence";
import { ChangeEvent } from "react";

import { Drawer } from "@mui/material";

interface AppDrawerProps {
    folders: ConversationFolder[];
    currentConversationId: string;
    onAddConversation: (folderId?: string) => void;
    onSwitchConversation: (id: string) => void;
    onAddFolder: (parentFolderId?: string) => void;
    onUpdateFolders: (updatedFolders: ConversationFolder[]) => void;
    onDelete: (id: string) => void;
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
    folders,
    currentConversationId,
    onAddConversation,
    onSwitchConversation,
    onAddFolder,
    onUpdateFolders,
    onDelete,
}: AppDrawerProps) {
    const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
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
            onUpdateFolders(folders.map(folder => {
                if (folder.id === editingFolderId) {
                    return { ...folder, name: newFolderName };
                }
                return folder;
            }));
            setEditingFolderId(null);
        }
    };

    const onDeleteFolder = () => {
        if (editingFolderId !== null) {
            onUpdateFolders(folders.filter(folder => folder.id !== editingFolderId));
            setEditingFolderId(null);
        }
    };

    const onSaveConversation = () => {
        if (editingConversationId !== null) {
            onUpdateFolders(folders.map(folder => ({
                ...folder,
                conversations: folder.conversations.map(conv =>
                    conv.id === editingConversationId
                        ? { ...conv, name: newConversationName }
                        : conv
                )
            })));
            setEditingConversationId(null);
        }
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
                onAddFolder={onAddFolder}
                onEditFolder={onEditFolder}
                onUpdateFolders={onUpdateFolders}
                onDelete={onDelete}
            />

            <FolderEditor
                editingFolderId={editingFolderId}
                newFolderName={newFolderName}
                onNameChange={(e: ChangeEvent<HTMLInputElement>) => setNewFolderName(e.target.value)}
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
