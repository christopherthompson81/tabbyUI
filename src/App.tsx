import { useState, useEffect, useCallback } from 'react'
import tabbyImage from './assets/tabby.jpeg'
import './App.css'

function App() {
  const [response, setResponse] = useState('');
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('serverUrl') || 'http://127.0.0.1:5000');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '5b60f806eabc44ba87a96d6c400307dd');
  const [showSettings, setShowSettings] = useState(false);
  const fetchTagline = useCallback(async () => {
    try {
      const res = await fetch(`${serverUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({ messages: [{ role: "user", content: "Write a tag line for an ice cream shop." }] }),
      });
      const data = await res.json();
      setResponse(data.choices[0].message.content); // Assuming the response is in a field called 'response'
    } catch (error) {
      console.error('Error fetching tagline:', error);
    }
  }, [serverUrl, apiKey]);
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
        <button onClick={fetchTagline}>
          Get Ice Cream Shop Tagline
        </button>
        {response && <p>{response}</p>}
      </div>
    </>
  )
}

export default App
