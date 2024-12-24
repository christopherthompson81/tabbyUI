import { useState, useEffect, useCallback, useRef } from 'react'
import tabbyImage from './assets/tabby.jpeg'
import './App.css'
import './sidebar.css'

function App() {
  const [conversations, setConversations] = useState<any[]>(JSON.parse(localStorage.getItem('conversations') || '[]'));
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('serverUrl') || 'http://127.0.0.1:5000');
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
      <div className="sidebar">
        <h2>Conversations</h2>
        <button onClick={addNewConversation}>New Conversation</button>
        <input ref={conversationNameRef} type="text" placeholder="Conversation Name" />
        {conversations.map(conv => (
          <div key={conv.id} onClick={() => switchConversation(conv.id)} className={conv.id === currentConversationId ? 'active' : ''}>
            {conv.name}
          </div>
        ))}
      <button onClick={() => setShowSettings(!showSettings)}>
          {/* Gear icon SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
            <path d="M19.44 13.94c.32.52.56 1.1.72 1.76l1.45-1.05c.14.55.22 1.12.22 1.71 0 .59-.08 1.16-.22 1.71l-1.45-1.05c-.16.66-.4 1.24-.72 1.76l1.45 1.05c.14.55.22 1.12.22 1.71 0 1.69-1.37 3.06-3.06 3.06-1.69 0-3.06-1.37-3.06-3.06 0-.59.08-1.16.22-1.71l-1.45 1.05c.16-.66.4-1.24.72-1.76l-1.45-1.05c-.14-.55-.22-1.12-.22-1.71 0-.59.08-1.16.22-1.71l1.45 1.05c.16-.66.4-1.24.72-1.76l-1.45-1.05c-.14-.55-.22-1.12-.22-1.71 0-1.69 1.37-3.06 3.06-3.06 1.69 0 3.06 1.37 3.06 3.06 0 .59-.08 1.16-.22 1.71l1.45-1.05c-.16.66-.4 1.24-.72 1.76l-1.45 1.05zm-7.44 1.56c1.39 0 2.5-1.11 2.5-2.5s-1.11-2.5-2.5-2.5-2.5 1.11-2.5 2.5 1.11 2.5 2.5 2.5z"/>
          </svg>
        </button>
        {/* Settings Dialog */}
        {showSettings && (
          <div className="modal-backdrop">
            <div className="modal">
              <h2>Settings</h2>
              <label>
                Server URL:
                <input
                  type="text"
                  value={serverUrl}
                  onChange={(e) => setServerUrl(e.target.value)}
                />
              </label>
              <label>
                API Key:
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </label>
              <button onClick={() => {
                localStorage.setItem('serverUrl', serverUrl);
                localStorage.setItem('apiKey', apiKey);
                setShowSettings(false); // Close the dialog after saving
              }}>
                Save Settings
              </button>
              <button onClick={() => setShowSettings(false)}>
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <div className="main-content">
        <img src={tabbyImage} width="250" />
        <h1>tabbyUI</h1>
        <div className="card">
          <div>
            {messages.map((msg, index) => (
              <div key={index} className={msg.role}>
                <strong>{msg.role === 'user' ? 'You:' : 'Assistant:'}</strong> {msg.content}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button onClick={() => {
            if (userInput.trim()) {
              fetchTagline(userInput);
              setUserInput('');
            }
          }}>
            Send
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
