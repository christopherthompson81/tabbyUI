import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import {
  getPersistedConversations,
  persistConversations,
  getPersistedCurrentConversationId,
  persistCurrentConversationId,
  getPersistedServerUrl,
  persistServerUrl,
  getPersistedApiKey,
  persistApiKey,
  getPersistedGenerationParams,
  persistGenerationParam
} from './utils/persistence';
import './styles.css';
import Message from './Message';
import {
  AppBar,  
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatInput from './components/ChatInput';
import ConversationList from './components/ConversationList';
import ConversationEditor from './components/ConversationEditor';
import SettingsDialog from './components/SettingsDialog';
import AboutDialog from './components/AboutDialog';
import { sendConversation as sendConversationToAPI } from './services/tabbyAPI';


function App() {
  const [conversations, setConversations] = useState<any[]>(getPersistedConversations());
  const [currentConversationId, setCurrentConversationId] = useState<string>(getPersistedCurrentConversationId());
  const [serverUrl, setServerUrl] = useState(getPersistedServerUrl());
  const [apiKey, setApiKey] = useState(getPersistedApiKey());
  const [generationParams, setGenerationParams] = useState(getPersistedGenerationParams());
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
    const storedConversations = getPersistedConversations();
    setConversations(storedConversations);
    let conversation = conversations.find(conv => conv.id === currentConversationId);
    setMessages(conversation.messages);
  }, []);

  useEffect(() => {
    persistConversations(conversations);
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
      persistConversations(updatedConversations);
    }
  }, [conversations, currentConversationId, messages]);

  const sendConversation = useCallback(async (userMessage: string, regenerate: boolean = false) => {
    if (!regenerate) {
      setOriginalUserInput(userMessage); // Store the original user input
    }
    
    try {
      await sendConversationToAPI(
        serverUrl,
        apiKey,
        messages,
        userMessage,
        regenerate,
        (updatedMessages) => {
          setMessages(updatedMessages);
          scrollToBottom();
        },
        (finalMessages) => {
          saveConversation(finalMessages);
        }
      );
    } catch (error) {
      console.error('Error sending conversation:', error);
    }
  }, [messages, serverUrl, apiKey, saveConversation]);

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
    persistCurrentConversationId(id);
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
            persistServerUrl(serverUrl);
            persistApiKey(apiKey);
            Object.entries(generationParams).forEach(([key, value]) => {
              persistGenerationParam(key, value);
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

        <AboutDialog
          open={showAbout}
          onClose={() => setShowAbout(false)}
        />
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
              sendConversation(userInput);
              setUserInput('');
            }
          }}
          onRegenerate={() => {
            if (messages.length > 0) {
              sendConversation(originalUserInput, true);
            }
          }}
        />
      </Box>
    </Box>
  );
}

export default App;
