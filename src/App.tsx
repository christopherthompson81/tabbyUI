import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import tabbyImage from './assets/tabby.png';
import './styles.css';
import Message from './Message';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    Typography,
    CssBaseline,
    Menu,
    MenuItem,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ConversationList from './components/ConversationList';
import ConversationEditor from './components/ConversationEditor';
import SettingsDialog from './components/SettingsDialog';
import ChatInput from './components/ChatInput';

function App() {
  const [conversations, setConversations] = useState<any[]>(
    JSON.parse(localStorage.getItem('conversations') || '[]')
  );
  const [currentConversationId, setCurrentConversationId] = useState<string>(
      JSON.parse(localStorage.getItem('currentConversationId') || '1')
    );
    
  const [serverUrl, setServerUrl] = useState(
    localStorage.getItem('serverUrl') || 'http://127.0.0.1:5000'
  );
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [generationParams, setGenerationParams] = useState({
    maxTokens: localStorage.getItem('maxTokens') || 150,
    temperature: localStorage.getItem('temperature') || 1,
    topP: localStorage.getItem('topP') || 1,
    topK: localStorage.getItem('topK') || -1,
    frequencyPenalty: localStorage.getItem('frequencyPenalty') || 0,
    presencePenalty: localStorage.getItem('presencePenalty') || 0,
    repetitionPenalty: localStorage.getItem('repetitionPenalty') || 1,
    typicalP: localStorage.getItem('typicalP') || 1,
    minTokens: localStorage.getItem('minTokens') || 0,
    generateWindow: localStorage.getItem('generateWindow') || 512,
    tokenHealing: localStorage.getItem('tokenHealing') || 'true',
    mirostatMode: localStorage.getItem('mirostatMode') || 0,
    mirostatTau: localStorage.getItem('mirostatTau') || 1.5,
    mirostatEta: localStorage.getItem('mirostatEta') || 0.3,
    addBosToken: localStorage.getItem('addBosToken') || 'true',
    banEosToken: localStorage.getItem('banEosToken') || 'false',
  });
  const [showSettings, setShowSettings] = useState(false);
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
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
    localStorage.setItem('currentConversationId', JSON.stringify(id));
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
        <ConversationList
          conversations={conversations}
          currentConversationId={currentConversationId}
          onAddConversation={addNewConversation}
          onSwitchConversation={switchConversation}
          onEditConversation={(id) => {
            setEditingConversationId(id);
            setNewConversationName(conversations.find(conv => conv.id === id).name);
          }}
        />

        <ConversationEditor
          editingConversationId={editingConversationId}
          newConversationName={newConversationName}
          onNameChange={(e) => setNewConversationName(e.target.value)}
          onSave={() => {
            if (editingConversationId !== null) {
              const updatedConversations = conversations.map(conv =>
                conv.id === editingConversationId ? { ...conv, name: newConversationName } : conv
              );
              setConversations(updatedConversations);
              localStorage.setItem('conversations', JSON.stringify(updatedConversations));
              setEditingConversationId(null);
            }
          }}
          onDelete={() => {
            if (editingConversationId !== null) {
              const updatedConversations = conversations.filter(conv => conv.id !== editingConversationId);
              setConversations(updatedConversations);
              localStorage.setItem('conversations', JSON.stringify(updatedConversations));
              if (currentConversationId === editingConversationId && updatedConversations.length > 0) {
                setCurrentConversationId(updatedConversations[0].id);
                setMessages(updatedConversations[0].messages);
              } else if (updatedConversations.length === 0) {
                setCurrentConversationId(1);
                setMessages([]);
              }
              setEditingConversationId(null);
            }
          }}
          onCancel={() => setEditingConversationId(null)}
        />

        <SettingsDialog
          open={showSettings}
          onClose={() => {
            localStorage.setItem('serverUrl', serverUrl);
            localStorage.setItem('apiKey', apiKey);
            Object.entries(generationParams).forEach(([key, value]) => {
              localStorage.setItem(key, value);
            });
            setShowSettings(false);
          }}
          serverUrl={serverUrl}
          onServerUrlChange={(e) => setServerUrl(e.target.value)}
          apiKey={apiKey}
          onApiKeyChange={(e) => setApiKey(e.target.value)}
          generationParams={generationParams}
          onGenerationParamsChange={(key, value) => setGenerationParams(prev => ({...prev, [key]: value}))}
        />

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
        
        <ChatInput
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onSend={() => {
            if (userInput.trim()) {
              fetchTagline(userInput);
              setUserInput('');
            }
          }}
          onRegenerate={() => {
            if (messages.length > 0) {
              fetchTagline(originalUserInput, true);
            }
          }}
        />
      </Box>
    </Box>
  );
}

export default App;
