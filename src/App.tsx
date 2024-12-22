import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0)
  const [response, setResponse] = useState('')
  const fetchTagline = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': '5b60f806eabc44ba87a96d6c400307dd',
        },
        body: JSON.stringify({ messages: [{role: "user", content: "Write a tag line for an ice cream shop."}]}),
      });
      const data = await res.json();
      setResponse(data.choices[0].message.content); // Assuming the response is in a field called 'response'
    } catch (error) {
      console.error('Error fetching tagline:', error);
    }
  };
  return (
    <>
      <h1>tabbyUI</h1>
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
