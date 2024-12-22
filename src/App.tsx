import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [response, setResponse] = useState('')

  return (
    <>
      <div>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>
          count is {count}
        </button>
        <button onClick={fetchTagline}>
          Get Ice Cream Shop Tagline
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
        {response && <p>{response}</p>}
      </div>
      <p className="read-the-docs">
        Click on the Vite and React logos to learn more
      </p>
    </>
  )
  const fetchTagline = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: 'Write a tag line for an ice cream shop.' }),
      });
      const data = await res.json();
      setResponse(data.response); // Assuming the response is in a field called 'response'
    } catch (error) {
      console.error('Error fetching tagline:', error);
    }
  };

}

export default App
