import { useState, useEffect, useCallback, useRef } from 'react'
import tabbyImage from './assets/tabby.jpeg'
import './App.css'
import './sidebar.css'

function App() {
  const [conversations, setConversations] = useState<{ id: number, name: string, messages: { role: string, content: string }[] }[]>(JSON.parse(localStorage.getItem('conversations') || '[]'));
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('serverUrl') || 'http://127.0.0.1:5000');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [userInput, setUserInput] = useState('');
  const conversationNameRef = useRef<HTMLInputElement>(null);

  const messages = currentConversationId !== null ? conversations.find(conv => conv.id === currentConversationId)?.messages || [] : [];

  const saveConversation = useCallback(() => {
    if (currentConversationId !== null) {
      const updatedConversations = conversations.map(conv => 
        conv.id === currentConversationId ? { ...conv, messages } : conv
      );
      setConversations(updatedConversations);
      localStorage.setItem('conversations', JSON.stringify(updatedConversations));
    }
  }, [conversations, currentConversationId, messages]);

  const fetchTagline = useCallback(async (userMessage: string) => {
    try {
      const updatedMessages = [...messages, { role: "user", content: userMessage }];
      const res = await fetch(`${serverUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey || '',
        },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      setMessages([...updatedMessages, data.choices[0].message]);
      saveConversation();
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
      </div>
      <div className="main-content">
        <img src={tabbyImage} width="250"/>
        <h1>tabbyUI</h1>
        <button onClick={() => setShowSettings(!showSettings)}>
          {showSettings ? 'Close Settings' : 'Open Settings'}
        </button>
        {showSettings && (
          <div>
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
            }}>
              Save Settings
            </button>
          </div>
        )}
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
  )
}

export default App
