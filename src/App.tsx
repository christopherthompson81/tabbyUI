import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import tabbyImage from './assets/tabby.png';
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
    AppBar,
    Toolbar,
    Typography,
    CssBaseline,
    Menu,
    MenuItem,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import MenuIcon from '@mui/icons-material/Menu';
import Button from "@mui/material/Button";
import SettingsIcon from "@mui/icons-material/Settings";

function App() {
  const [conversations, setConversations] = useState<any[]>(
    JSON.parse(localStorage.getItem('conversations') || '[]')
  );
  const [currentConversationId, setCurrentConversationId] =
    useState<string>(
      JSON.parse(localStorage.getItem('currentConversationId') || '1')
    );
    
  const [serverUrl, setServerUrl] = useState(
    localStorage.getItem('serverUrl') || 'http://127.0.0.1:5000'
  );
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [conversationAnchorEl, setConversationAnchorEl] = useState<null | HTMLElement>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [editingConversationId, setEditingConversationId] = useState<number | null>(null);
  const [newConversationName, setNewConversationName] = useState('');
  const [userInput, setUserInput] = useState('');
  const [originalUserInput, setOriginalUserInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      window.scrollTo(0, document.body.scrollHeight);
    }
  };
  
  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    const storedConversations = JSON.parse(localStorage.getItem('conversations') || '[]');
    setConversations(storedConversations);
    let conversation = conversations.find(conv => conv.id === currentConversationId);
    setMessages(conversation.messages);
  }, []);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const saveConversation = useCallback((v) => {
    if (currentConversationId !== null) {
      let updatedConversations = [...conversations];
      for (let conv of updatedConversations) {
        if (conv.id === currentConversationId) {
          conv.messages = v;
        }
      }
      //console.log("saveConversation1", currentConversationId, messages, updatedConversations);
      setConversations(updatedConversations);
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    }
  }, [conversations, currentConversationId, messages]);

  const fetchTagline = useCallback(async (userMessage: string, regenerate: boolean = false) => {
    try {
      let updatedMessages: any[];
      if (regenerate) {
        updatedMessages = messages.slice(0, -1); // Remove the last response
      } else {
        updatedMessages = [...messages, { role: "user", content: userMessage }];
        setOriginalUserInput(userMessage); // Store the original user input
      }
      setMessages(updatedMessages);
      fetch(`${serverUrl}/v1/chat/completions?stream=true`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
        },
        body: JSON.stringify({
          messages: updatedMessages,
          stream: true
        }),
      })
      .then(response => {
        console.log(response);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const stream = response.body;
        const reader = stream.getReader();
        const decoder = new TextDecoder('utf-8');
        updatedMessages.push({role: "assistant", content: ""});
        setMessages(updatedMessages);
        function processText({ done, value }) {
            if (done) {
                console.log('Stream complete');
                return;
            }
            //console.log('Chunk: ', decoder.decode(value));
            let chunk = decoder.decode(value);
            const separateLines = chunk.split(/data: /g);
            separateLines.forEach(line => {
              if (line.trim() === "[DONE]") {
                console.log("Finished Streaming");
              }
              else if (line.trim()) {
                //console.log(line);
                try {
                  const data = JSON.parse(line);
                  //console.log(data);
                  if (data.choices[0].delta.content) {
                    updatedMessages[updatedMessages.length - 1].content += data.choices[0].delta.content;
                  }
                }
                catch (error) {
                  console.log(error, chunk.substring(6));
                }
              }
            });
            setMessages(updatedMessages);
            saveConversation(updatedMessages);
            scrollToBottom();
            return reader.read().then(processText);
        }
        return reader.read().then(processText);
      });
      
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
    setMessages(conversation.messages);
    localStorage.setItem('currentConversationId', JSON.stringify(currentConversationId));
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            sx={{ mr: 2 }}
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={() => setMenuAnchorEl(null)}
          >
            <MenuItem onClick={() => {
              setMenuAnchorEl(null);
              setShowSettings(true);
            }}>
              Settings
            </MenuItem>
            <MenuItem onClick={() => {
              setMenuAnchorEl(null);
              setShowAbout(true);
            }}>
              About
            </MenuItem>
          </Menu>
          <Typography variant="h6" noWrap component="div">
            tabbyUI
          </Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box',
          },
        }}
      >
        <List>
          <ListItem>
            <h2>Conversations</h2>
          </ListItem>
          <Dialog open={editingConversationId !== null} onClose={() => {
            setEditingConversationId(null);
            setNewConversationName('');
          }}>
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
                  setConversationAnchorEl(e.currentTarget);
                  setEditingConversationId(conv.id);
                }}
                style={{ marginLeft: 'auto' }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </ListItemButton>
          ))}
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

        {/* About Dialog */}
        <Dialog open={showAbout} onClose={() => setShowAbout(false)}>
          <DialogTitle>About tabbyUI</DialogTitle>
          <DialogContent>
            <img src={tabbyImage} width="250" alt="Tabby" style={{ display: 'block', margin: '0 auto' }} />
            <Typography variant="h4" align="center" sx={{ mt: 2 }}>
              tabbyUI
            </Typography>
            <Typography variant="body1" align="center" sx={{ mt: 2 }}>
              A simple chat interface for Tabby
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowAbout(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <div className="main-content">
          {messages.map((msg, index) => (
            <Message key={index} role={msg.role} content={msg.content} />
          ))}
          <div ref={messagesEndRef} />
        </div>
        {/* Removed messagesEndRef div */}
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
        <Button
          variant="contained"
          onClick={() => {
            if (messages.length > 0) {
              fetchTagline(originalUserInput, true);
            }
          }}
        >
          Regenerate
        </Button>
      </Box>
    </Box>
  );
}

export default App;
