import { useState, useEffect, useCallback, useRef } from "react";
import tabbyImage from "./assets/tabby.jpeg";
import "./App.css";
import "./sidebar.css";
import Message from "./Message";
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
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
  const [userInput, setUserInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const conversationNameRef = useRef<HTMLInputElement>(null);

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
      const res = await fetch(`${serverUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      updatedMessages.push({role: data.choices[0].message.role, content: data.choices[0].message.content});
      setMessages(updatedMessages);
      console.log("fetchTagline1", currentConversationId, updatedMessages, data.choices[0].message, [...messages]);
      saveConversation(updatedMessages);
    } catch (error) {
      console.error('Error fetching tagline:', error);
    }
  }, [messages, serverUrl, apiKey, saveConversation]);
  

  const addNewConversation = () => {
    const newId = conversations.length > 0 ? Math.max(...conversations.map(conv => conv.id)) + 1 : 1;
    const newConversation = { id: newId, name: conversationNameRef.current?.value || `Conversation ${newId}`, messages: [] };
    setConversations([...conversations, newConversation]);
    setCurrentConversationId(newId);
    conversationNameRef.current!.value = '';
  };

  const switchConversation = (id: number) => {
    setCurrentConversationId(id);
    let conversation = conversations.find(conv => conv.id === id);
    console.log(conversation.messages);
    setMessages(conversation.messages);
  };

  return (
    <>
      <Drawer variant="permanent" anchor="left">
        <List>
          <ListItem>
            <h2>Conversations</h2>
          </ListItem>
          <ListItem>
            <Button variant="contained" onClick={addNewConversation}>
              New Conversation
            </Button>
          </ListItem>
          <ListItem>
            <TextField
              inputRef={conversationNameRef}
              label="Conversation Name"
              variant="outlined"
              size="small"
              margin="normal"
            />
          </ListItem>
          {conversations.map((conv) => (
            <ListItemButton
              key={conv.id}
              onClick={() => switchConversation(conv.id)}
              selected={conv.id === currentConversationId}
            >
              <ListItemText primary={conv.name} />
            </ListItemButton>
          ))}
          <ListItem>
            <IconButton onClick={() => setShowSettings(true)}>
              <SettingsIcon />
            </IconButton>
          </ListItem>
        </List>

        {/* Settings Dialog */}
        {/* Settings Dialog */}
        <Dialog open={showSettings} onClose={() => setShowSettings(false)}>
          <DialogTitle>Settings</DialogTitle>
          <DialogContent>
            <TextField
              label="Server URL"
              variant="outlined"
              fullWidth
              margin="normal"
              value={serverUrl}
              onChange={(e) => setServerUrl(e.target.value)}
            />
            <TextField
              label="API Key"
              variant="outlined"
              fullWidth
              margin="normal"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                localStorage.setItem("serverUrl", serverUrl);
                localStorage.setItem("apiKey", apiKey);
                setShowSettings(false);
              }}
            >
              Save Settings
            </Button>
            <Button onClick={() => setShowSettings(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      </Drawer>
      <div
        className="main-content"
        style={{ width: "100%", marginLeft: "240px" }}
      >
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
            if (e.key === "Enter" && userInput.trim()) {
              fetchTagline(userInput);
              setUserInput("");
            }
          }}
        />
        <Button
          variant="contained"
          onClick={() => {
            if (userInput.trim()) {
              fetchTagline(userInput);
              setUserInput("");
            }
          }}
        >
          Send
        </Button>
      </div>
    </>
  );
}

export default App;

export default App;
