import { useState } from 'react';
import { List, ListItem, ListItemButton, ListItemText, IconButton, Button, Collapse, Box, Typography, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Conversation, ConversationFolder, getPersistedCurrentConversationId } from '../utils/persistence';
import DeleteConfirmationDialog from "./DeleteConfirmationDialog";

interface ConversationListProps {
  folders: ConversationFolder[];
  currentConversationId: string;
  onAddConversation: (folderId?: string) => void;
  onSwitchConversation: (id: string) => void;
  onEditConversation: (id: string) => void;
  onAddFolder: (parentFolderId?: string) => void;
  onEditFolder: (id: string) => void;
  onDelete: (id: string) => void;
}

// FolderItem needs it own interface and should not reuse ConversationListProps as its interface AI! 
function FolderItem({ 
  folder,
  currentConversationId,
  onAddConversation,
  onSwitchConversation,
  onEditConversation,
  onAddFolder,
  onEditFolder,
  onDelete
}: {
  folder: ConversationFolder;
} & ConversationListProps) {
  const [open, setOpen] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [conversationMenuAnchorEl, setConversationMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const menuOpen = Boolean(menuAnchorEl);

  const handleConversationMenuClick = (event: React.MouseEvent<HTMLElement>, conversation: Conversation) => {
    event.stopPropagation();
    setConversationMenuAnchorEl(event.currentTarget);
    setSelectedConversation(conversation);
  };

  const handleConversationMenuClose = () => {
    setConversationMenuAnchorEl(null);
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <>
      <ListItemButton sx={{ p: 0 }}>
        <Box 
          onClick={() => setOpen(!open)}
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            flexGrow: 1,
            p: '8px 16px' // Match ListItemButton padding
          }}
        >
          {open ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
          <ListItemText primary={folder.name} sx={{ ml: 1 }} />
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
        <IconButton
          onClick={handleMenuClick}
          sx={{ mr: 1 }}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>
        <Menu
          anchorEl={menuAnchorEl}
          open={menuOpen}
          onClose={handleMenuClose}
          onClick={handleMenuClose}
        >
          <MenuItem onClick={() => {
            onEditFolder(folder.id);
            handleMenuClose();
          }}>
            Rename Folder
          </MenuItem>
          <MenuItem onClick={() => {
            onAddConversation(folder.id);
            handleMenuClose();
          }}>
            Add Conversation
          </MenuItem>
          <MenuItem onClick={() => {
            onAddFolder(folder.id);
            handleMenuClose();
          }}>
            Add Subfolder
          </MenuItem>
        </Menu>
      </ListItemButton>
      <Collapse in={open} timeout="auto" unmountOnExit>
        <Box sx={{ pl: 2 }}>
          {folder.conversations.map((conv) => (
            <ListItemButton 
              key={conv.id} 
              onClick={() => onSwitchConversation(conv.id)} 
              selected={conv.id === currentConversationId}
              sx={{ pl: 4 }}
            >
              <ListItemText 
                primary={conv.name} 
                secondary={new Date(conv.timestamp).toLocaleString()} 
              />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleConversationMenuClick(e, conv);
                }}
                style={{ marginLeft: 'auto' }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
              <Menu
                anchorEl={conversationMenuAnchorEl}
                open={Boolean(conversationMenuAnchorEl)}
                onClose={handleConversationMenuClose}
                onClick={handleConversationMenuClose}
              >
                <MenuItem onClick={() => {
                  onEditConversation(selectedConversation?.id || '');
                }}>
                  Rename
                </MenuItem>
                <MenuItem onClick={() => {
                  setDeleteDialogOpen(true);
                }}>
                  Delete
                </MenuItem>
                <MenuItem onClick={() => {
                  // TODO: Implement save conversation
                  console.log('Save conversation:', selectedConversation?.id);
                }}>
                  Save Conversation
                </MenuItem>
              </Menu>
            </ListItemButton>
          ))}
          {folder.subfolders.map((subfolder) => (
            <FolderItem
              key={subfolder.id}
              folder={subfolder}
              currentConversationId={currentConversationId}
              onAddConversation={onAddConversation}
              onSwitchConversation={onSwitchConversation}
              onEditConversation={onEditConversation}
              onAddFolder={onAddFolder}
              onEditFolder={onEditFolder}
              onDelete={onDelete}
            />
          ))}
        </Box>
      </Collapse>
      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onConfirm={() => {
          if (selectedConversation) {
            onDelete(selectedConversation.id);
          }
          setDeleteDialogOpen(false);
          setSelectedConversation(null);
        }}
        onCancel={() => setDeleteDialogOpen(false)}
        itemName={selectedConversation?.name || ''}
      />
    </>
  );
}

export default function ConversationList({ 
  folders, 
  onAddConversation,
  onSwitchConversation,
  onEditConversation,
  onAddFolder,
  onEditFolder,
  onDelete
}: ConversationListProps) {
  const currentConversationId = getPersistedCurrentConversationId();
  return (
    <>
      <List>
        <ListItem>
          <Typography variant="h6">Conversations</Typography>
        </ListItem>
        {folders.map((folder) => (
          <FolderItem
            key={folder.id}
            folder={folder}
            currentConversationId={currentConversationId}
            onAddConversation={onAddConversation}
            onSwitchConversation={onSwitchConversation}
            onEditConversation={onEditConversation}
            onAddFolder={onAddFolder}
            onEditFolder={onEditFolder}
            onDelete={onDelete}
          />
        ))}
        <ListItem>
          <Button 
            variant="contained" 
            fullWidth
            onClick={() => onAddFolder()}
          >
            New Folder
          </Button>
        </ListItem>
      </List>
    </>
  );
}
