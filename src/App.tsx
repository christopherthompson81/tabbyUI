import { useState, useEffect, useCallback } from 'react';
import tabbyImage from './assets/tabby.jpeg';
import './styles.css';
import Message from './Message';
import {
    Box,
    Drawer,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import Button from "@mui/material/Button";
import SettingsIcon from "@mui/icons-material/Settings";

function App() {
  const [conversations, setConversations] = useState<any[]>(
    JSON.parse(localStorage.getItem('conversations') || '[]')
  );
  const [currentConversationId, setCurrentConversationId] =
    useState<number | null>(null);
  const [serverUrl, setServerUrl] = useState(
    localStorage.getItem('serverUrl') || 'http://127.0.0.1:5000'
  );
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState<number | null>(null);
  const [newConversationName, setNewConversationName] = useState('');
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  
  useEffect(() => {
    const storedConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    setConversations(storedConversations);
  }, []);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const saveConversation = useCallback((v) => {
    if (currentConversationId !== null) {
      let updatedConversations = [...conversations];
      for (let conv of updatedConversations) {
        if (conv.id === currentConversationId) {
          console.log(`Updating ${conv.id} with `, v)
          conv.messages = v;
        }
      }
      console.log("saveConversation1", currentConversationId, messages, updatedConversations);
      setConversations(updatedConversations);
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    }
  }, [conversations, currentConversationId, messages]);

  const fetchTagline = useCallback(async (userMessage: string) => {
    try {
      let updatedMessages = [...messages, { role: "user", content: userMessage }];
      setMessages(updatedMessages);
      const eventSource = new EventSource(`${serverUrl}/v1/chat/completions?stream=true`, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
        },
        method: 'POST',
        body: JSON.stringify({ messages: updatedMessages }),
      });

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
          const newContent = data.choices[0].delta.content;
          setMessages((prevMessages) => {
            const lastMessage = prevMessages[prevMessages.length - 1];
            const updatedLastMessage = {
              ...lastMessage,
              content: lastMessage.content + newContent,
            };
            return [...prevMessages.slice(0, -1), updatedLastMessage];
          });
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource.close();
      };
    } catch (error) {
      console.error('Error fetching tagline:', error);
    }
  }, [messages, serverUrl, apiKey]);

  const addNewConversation = () => {
    const newId = conversations.length > 0 ? Math.max(...conversations.map(conv => conv.id)) + 1 : 1;
    const newConversationName = new Date().toISOString();
    const newConversation = { id: newId, name: newConversationName, messages: [] };
    setConversations([...conversations, newConversation]);
    setCurrentConversationId(newId);
  };

  const switchConversation = (id: number) => {
    setCurrentConversationId(id);
    let conversation = conversations.find(conv => conv.id === id);
    console.log(conversation.messages);
    setMessages(conversation.messages);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Drawer variant="permanent" anchor="left">
        <List>
          <ListItem>
            <h2>Conversations</h2>
          </ListItem>
          <Dialog open={editingConversationId !== null} onClose={() => setEditingConversationId(null)}>
            <DialogTitle>Edit Conversation Name</DialogTitle>
            <DialogContent>
              <TextField
                label="Conversation Name"
                variant="outlined"
                fullWidth
                margin="normal"
                value={newConversationName}
                onChange={(e) => setNewConversationName(e.target.value)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={() => {
                if (editingConversationId !== null) {
                  const updatedConversations = conversations.map(conv =>
                    conv.id === editingConversationId ? { ...conv, name: newConversationName } : conv
                  );
                  setConversations(updatedConversations);
                  localStorage.setItem('conversations', JSON.stringify(updatedConversations));
                }
                setEditingConversationId(null);
              }}>
                Save
              </Button>
              <Button onClick={() => setEditingConversationId(null)}>Cancel</Button>
            </DialogActions>
          </Dialog>
          <ListItem>
            <Button variant="contained" onClick={addNewConversation}>
              New Conversation
            </Button>
          </ListItem>
          {conversations.map((conv) => (
            <ListItemButton key={conv.id} onClick={() => switchConversation(conv.id)} selected={conv.id === currentConversationId}>
              <ListItemText primary={conv.name} />
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  setEditingConversationId(conv.id);
                  setNewConversationName(conv.name);
                }}
                style={{ marginLeft: 'auto' }}
              >
                <EditIcon />
              </IconButton>
            </ListItemButton>
          ))}
          <ListItem>
            <IconButton onClick={() => setShowSettings(true)}>
              <SettingsIcon />
            </IconButton>
          </ListItem>
        </List>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onClose={() => setShowSettings(false)}>
          <DialogTitle>Settings</DialogTitle>
          <DialogContent>
            <TextField label="Server URL" variant="outlined" fullWidth margin="normal" value={serverUrl} onChange={(e) => setServerUrl(e.target.value)} />
            <TextField label="API Key" variant="outlined" fullWidth margin="normal" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => {
              localStorage.setItem('serverUrl', serverUrl);
              localStorage.setItem('apiKey', apiKey);
              setShowSettings(false);
            }}>
              Save Settings
            </Button>
            <Button onClick={() => setShowSettings(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <img src={tabbyImage} width="250" alt="Tabby" />
        <h1>tabbyUI</h1>
        {messages.map((msg, index) => (
          <Message key={index} role={msg.role} content={msg.content} />
        ))}
        <TextField
          label="Enter your message"
          variant="outlined"
          fullWidth
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && userInput.trim()) {
              fetchTagline(userInput);
              setUserInput('');
            }
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            if (userInput.trim()) {
              fetchTagline(userInput);
              setUserInput('');
            }
          }}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
}

export default App;
