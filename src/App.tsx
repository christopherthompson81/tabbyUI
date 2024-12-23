import { useState, useEffect, useCallback } from 'react'
import tabbyImage from './assets/tabby.jpeg'
import './App.css'

function App() {
  const [messages, setMessages] = useState<{ role: string, content: string }[]>([]);
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('serverUrl') || 'http://127.0.0.1:5000');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [showSettings, setShowSettings] = useState(false);
  const [userInput, setUserInput] = useState('');
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
    } catch (error) {
      console.error('Error fetching tagline:', error);
    }
  }, [messages, serverUrl, apiKey]);
  return (
    <>
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
    </>
  )
}

export default App
