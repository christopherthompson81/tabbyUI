import { useState } from 'react';
import { List, ListItem, ListItemButton, ListItemText, IconButton, Button, Collapse, Box, Typography, Menu, MenuItem } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import FolderIcon from '@mui/icons-material/Folder';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Conversation, ConversationFolder } from '../utils/persistence';

interface ConversationListProps {
  folders: ConversationFolder[];
  currentConversationId: string;
  onAddConversation: (folderId?: string) => void;
  onSwitchConversation: (id: string) => void;
  onEditConversation: (id: string) => void;
  onAddFolder: (parentFolderId?: string) => void;
  onEditFolder: (id: string) => void;
  onUpdateFolders: (updatedFolders: ConversationFolder[]) => void;
}

function FolderItem({ 
  folder,
  currentConversationId,
  onAddConversation,
  onSwitchConversation,
  onEditConversation,
  onAddFolder
}: {
  folder: ConversationFolder;
} & ConversationListProps) {
  const [open, setOpen] = useState(true);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <>
      <ListItemButton onClick={() => setOpen(!open)}>
        {open ? <FolderOpenIcon fontSize="small" /> : <FolderIcon fontSize="small" />}
        <ListItemText primary={folder.name} sx={{ ml: 1 }} />
        {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        <IconButton
          onClick={handleMenuClick}
          style={{ marginLeft: 'auto' }}
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
                  onEditConversation(conv.id);
                }}
                style={{ marginLeft: 'auto' }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
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
            />
          ))}
        </Box>
      </Collapse>
    </>
  );
}

export default function ConversationList({ 
  folders, 
  currentConversationId,
  onAddConversation,
  onSwitchConversation,
  onEditConversation,
  onAddFolder,
  onUpdateFolders
}: ConversationListProps) {
  return (
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
  );
}
