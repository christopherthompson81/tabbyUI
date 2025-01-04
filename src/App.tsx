import React from "react";
import { useState, useEffect, useCallback, useRef, useLayoutEffect } from 'react';
import { ModelInfo, getModelInfo } from './services/tabbyAPI';
import Message from './Message';
import { MessageProps } from './Message';
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
  persistGenerationParam,
  persistAdminApiKey,
  getPersistedAdminApiKey,
} from './utils/persistence';
import './styles.css';
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
import ModelsDialog from './components/ModelsDialog';
import { MessageContent, sendConversation as sendConversationToAPI } from './services/tabbyAPI';

function App() {
  const [folders, setFolders] = useState<ConversationFolder[]>(getPersistedConversations());
  const [currentConversationId, setCurrentConversationId] = useState<string>(getPersistedCurrentConversationId());
  const [serverUrl, setServerUrl] = useState(getPersistedServerUrl());
  const [apiKey, setApiKey] = useState(getPersistedApiKey());
  const [adminApiKey, setAdminApiKey] = useState(getPersistedAdminApiKey());
  const [generationParams, setGenerationParams] = useState(() => getPersistedGenerationParams());
  const [showSettings, setShowSettings] = useState(!Boolean(getPersistedApiKey()));
  const [menuAnchorEl, setMenuAnchorEl] = React.useState<null | HTMLElement>(null);
  const [showAbout, setShowAbout] = useState(false);
  const [showModels, setShowModels] = useState(false);
  const [serverStatus, setServerStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [editingConversationId, setEditingConversationId] = useState<string | null>(null);
  const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
  const [newConversationName, setNewConversationName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [originalUserInput, setOriginalUserInput] = useState<MessageContent[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      // Only scroll if user is near bottom
      const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
      if (scrollHeight - (scrollTop + clientHeight) < 100) {
        messagesEndRef.current.scrollIntoView({ behavior: 'auto' });
      }
    }
  }, []);
  
  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    let tempConversationId = getPersistedCurrentConversationId();
    if (!tempConversationId) {
      addNewConversation();
      setMessages([]);
      saveConversation([]);
      tempConversationId = 1;
      setCurrentConversationId(tempConversationId.toString());
    }
    else {
      switchConversation(tempConversationId);
    }
    const checkStatus = async () => {
      setServerStatus('checking');
      const model = await getModelInfo(serverUrl, apiKey);
      if (model) {
        setServerStatus('online');
        setModelInfo(model);
      } else {
        setServerStatus('offline');
        setModelInfo(null);
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [serverUrl, apiKey]);

  const saveConversation = useCallback((v: MessageProps[]) => {
    if (currentConversationId !== null) {
      setConversations(prev => {
        const updatedConversations = prev.map(conv => 
          conv.id === currentConversationId ? { ...conv, messages: v } : conv
        );
        // Throttle persistence
        setTimeout(() => persistConversations(updatedConversations), 100);
        return updatedConversations;
      });
    }
  }, [currentConversationId]);

  const sendConversation = useCallback(async (userMessage: MessageContent[], regenerate: boolean = false) => {
    if (!regenerate) {
      setOriginalUserInput([...userMessage]); // Store the original user input
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

  const addNewConversation = (folderId = 'root') => {
    const newId = Date.now().toString();
    const newConversationName = new Date().toLocaleString();
    const newConversation: Conversation = { 
      id: newId,
      name: newConversationName,
      messages: [],
      timestamp: Date.now(),
      author: 'User'
    };
    
    setFolders(prev => {
      const updatedFolders = [...prev];
      const folder = findFolder(updatedFolders, folderId);
      if (folder) {
        folder.conversations.push(newConversation);
      }
      persistConversations(updatedFolders);
      return updatedFolders;
    });
    
    setCurrentConversationId(newId);
  };

  const addNewFolder = (parentFolderId = 'root') => {
    const newId = Date.now().toString();
    const newFolder: ConversationFolder = {
      id: newId,
      name: 'New Folder',
      conversations: [],
      subfolders: [],
      timestamp: Date.now(),
      author: 'User'
    };
    
    setFolders(prev => {
      const updatedFolders = [...prev];
      const parentFolder = findFolder(updatedFolders, parentFolderId);
      if (parentFolder) {
        parentFolder.subfolders.push(newFolder);
      }
      persistConversations(updatedFolders);
      return updatedFolders;
    });
  };

  const findFolder = (folders: ConversationFolder[], folderId: string): ConversationFolder | undefined => {
    for (const folder of folders) {
      if (folder.id === folderId) return folder;
      const found = findFolder(folder.subfolders, folderId);
      if (found) return found;
    }
    return undefined;
  };

  const switchConversation = (id: number) => {
    setCurrentConversationId(id.toString());
    let conversation = conversations.find(conv => conv.id === id);
    setMessages(conversation.messages);
    persistCurrentConversationId(id);
  };

  const mainMenuClose = () => {
    setMenuAnchorEl(null);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            id="main-menu-button"
            color="inherit"
            edge="start"
            sx={{ mr: 2 }}
            onClick={(e) => setMenuAnchorEl(e.currentTarget)}
            ref={menuAnchorEl}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="main-menu"
            anchorEl={menuAnchorEl}
            open={Boolean(menuAnchorEl)}
            onClose={mainMenuClose}
            MenuListProps={({'aria-labelledby': 'main-menu-button',})}
          >
            <MenuItem onClick={() => {
              mainMenuClose();
              setShowSettings(true);
            }}>
              Settings
            </MenuItem>
            <MenuItem onClick={() => {
              mainMenuClose();
              setShowModels(true);
            }}>
              Models
            </MenuItem>
            <MenuItem onClick={() => {
              mainMenuClose();
              setShowAbout(true);
            }}>
              About
            </MenuItem>
          </Menu>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            tabbyUI
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box sx={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: serverStatus === 'online' ? 'lime' : 
                             serverStatus === 'offline' ? 'red' : 'orange'
            }} />
            <Typography variant="caption">
              {serverStatus === 'online' ? `Online (${modelInfo?.id || 'Unknown'})` : 
               serverStatus === 'offline' ? 'Offline' : 'Checking...'}
            </Typography>
          </Box>
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
          folders={folders}
          currentConversationId={currentConversationId}
          onAddConversation={addNewConversation}
          onSwitchConversation={switchConversation}
          onEditConversation={(id:string) => {
            setEditingConversationId(id);
            // Find conversation in nested folders
            const conversation = findConversation(folders, id);
            if (conversation) {
              setNewConversationName(conversation.name);
            }
          }}
          onAddFolder={addNewFolder}
          onEditFolder={(id: string) => {
            setEditingFolderId(id);
            const folder = findFolder(folders, id);
            if (folder) {
              setNewFolderName(folder.name);
            }
          }}
        />

        <FolderEditor
          editingFolderId={editingFolderId}
          newFolderName={newFolderName}
          onNameChange={(e:any) => setNewFolderName(e.target.value)}
          onSave={() => {
            if (editingFolderId !== null) {
              setFolders(prev => {
                const updatedFolders = [...prev];
                const folder = findFolder(updatedFolders, editingFolderId);
                if (folder) {
                  folder.name = newFolderName;
                }
                persistConversations(updatedFolders);
                return updatedFolders;
              });
              setEditingFolderId(null);
            }
          }}
          onDelete={() => {
            if (editingFolderId !== null) {
              setFolders(prev => {
                const updatedFolders = [...prev];
                const deleteFolder = (folders: ConversationFolder[], id: string): boolean => {
                  for (let i = 0; i < folders.length; i++) {
                    if (folders[i].id === id) {
                      folders.splice(i, 1);
                      return true;
                    }
                    if (deleteFolder(folders[i].subfolders, id)) {
                      return true;
                    }
                  }
                  return false;
                };
                deleteFolder(updatedFolders, editingFolderId);
                persistConversations(updatedFolders);
                return updatedFolders;
              });
              setEditingFolderId(null);
            }
          }}
          onCancel={() => setEditingFolderId(null)}
        />
        <ConversationEditor
          editingConversationId={editingConversationId}
          newConversationName={newConversationName}
          onNameChange={(e:any) => setNewConversationName(e.target.value)}
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
              if (currentConversationId === editingConversationId.toString() && updatedConversations.length > 0) {
                setCurrentConversationId(updatedConversations[0].id);
                setMessages(updatedConversations[0].messages);
              } else if (updatedConversations.length === 0) {
                setCurrentConversationId("1");
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
            persistAdminApiKey(adminApiKey);
            Object.entries(generationParams).forEach(([key, value]) => {
              persistGenerationParam(key, value.toString());
            });
            setShowSettings(false);
          }}
          serverUrl={serverUrl}
          onServerUrlChange={(e) => setServerUrl(e.target.value)}
          apiKey={apiKey}
          onApiKeyChange={(e) => setApiKey(e.target.value)}
          adminApiKey={adminApiKey}
          onAdminApiKeyChange={(e) => setAdminApiKey(e.target.value)}
          generationParams={generationParams}
          onGenerationParamsChange={useCallback((key, value) => {
            setGenerationParams(prev => ({...prev, [key]: value}));
          }, [])}
        />

        <AboutDialog
          open={showAbout}
          onClose={() => setShowAbout(false)}
        />
        <ModelsDialog
          open={showModels}
          onClose={() => setShowModels(false)}
          serverUrl={serverUrl}
          adminApiKey={adminApiKey}
        />
      </Drawer>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <div className="main-content">
          {messages.map((message, index) => (
            <Message
              key={index}
              role={message.role}
              content={message.content}
              onEdit={(i, newContent) => {
                const updatedMessages = [...messages];
                updatedMessages[i].content = newContent;
                saveConversation(updatedMessages);
              }}
              onDelete={(i) => {
                const updatedMessages = messages.filter((_, idx) => idx !== i);
                saveConversation(updatedMessages);
              }}
              index={index}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
        
        <ChatInput
          onSend={(content: MessageContent[]) => {
            if (content.length > 0) {
              sendConversation(content);
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
