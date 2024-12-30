import { List, ListItem, ListItemButton, ListItemText, IconButton, Button } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export default function ConversationList({ 
  conversations, 
  currentConversationId,
  onAddConversation,
  onSwitchConversation,
  onEditConversation
}) {
  return (
    <List>
      <ListItem>
        <h2>Conversations</h2>
      </ListItem>
      <ListItem>
        <Button variant="contained" onClick={onAddConversation}>
          New Conversation
        </Button>
      </ListItem>
      {conversations.map((conv) => (
        <ListItemButton 
          key={conv.id} 
          onClick={() => onSwitchConversation(conv.id)} 
          selected={conv.id === currentConversationId}
        >
          <ListItemText primary={conv.name} />
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
    </List>
  );
}
