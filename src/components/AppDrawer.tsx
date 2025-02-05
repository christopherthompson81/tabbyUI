import AppDrawer from "./components/AppDrawer";
import { useState } from "react";
import ConversationList from "./ConversationList";
import ConversationEditor from "./ConversationEditor";
import FolderEditor from "./FolderEditor";
import { ConversationFolder } from "../utils/persistence";
import { ChangeEvent } from "react";

interface AppDrawerProps {
    folders: ConversationFolder[];
    currentConversationId: string;
    onAddConversation: (folderId?: string) => void;
    onSwitchConversation: (id: string) => void;
    onEditConversation: (id: string) => void;
    onAddFolder: (parentFolderId?: string) => void;
    onEditFolder: (id: string) => void;
    onUpdateFolders: (updatedFolders: ConversationFolder[]) => void;
    onDelete: (id: string) => void;
}

export default function AppDrawer({
    folders,
    currentConversationId,
    onAddConversation,
    onSwitchConversation,
    onEditConversation,
    onAddFolder,
    onEditFolder,
    onUpdateFolders,
    onDelete,
}: AppDrawerProps) {
    const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [newConversationName, setNewConversationName] = useState("");
    const [newFolderName, setNewFolderName] = useState("");

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
                onEditConversation={(id: string) => {
                    setEditingConversationId(id);
                    const conversation = findConversation(folders, id);
                    if (conversation) {
                        setNewConversationName(conversation.name);
                    }
                }}
                onAddFolder={onAddFolder}
                onEditFolder={(id: string) => {
                    setEditingFolderId(id);
                    const folder = findFolder(folders, id);
                    if (folder) {
                        setNewFolderName(folder.name);
                    }
                }}
                onUpdateFolders={onUpdateFolders}
                onDelete={onDelete}
            />

            <FolderEditor
                editingFolderId={editingFolderId}
                newFolderName={newFolderName}
                onNameChange={(e: ChangeEvent<HTMLInputElement>) => setNewFolderName(e.target.value)}
                onSave={() => {
                    if (editingFolderId !== null) {
                        onUpdateFolders(folders.map(folder => {
                            if (folder.id === editingFolderId) {
                                return { ...folder, name: newFolderName };
                            }
                            return folder;
                        }));
                        setEditingFolderId(null);
                    }
                }}
                onDelete={() => {
                    if (editingFolderId !== null) {
                        onUpdateFolders(folders.filter(folder => folder.id !== editingFolderId));
                        setEditingFolderId(null);
                    }
                }}
                onCancel={() => setEditingFolderId(null)}
            />
            <ConversationEditor
                editingConversationId={editingConversationId}
                newConversationName={newConversationName}
                onNameChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setNewConversationName(e.target.value)
                }
                onSave={() => {
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
                }}
                onCancel={() => setEditingConversationId(null)}
            />
        </Drawer>
    );
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

function findConversation(folders: ConversationFolder[], id: string) {
    for (const folder of folders) {
        const conversation = folder.conversations.find(conv => conv.id === id);
        if (conversation) return conversation;
        const found = findConversation(folder.subfolders, id);
        if (found) return found;
    }
    return undefined;
}
