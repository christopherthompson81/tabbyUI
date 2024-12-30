import { MessageProps } from '../Message';

interface TabbyAPIResponse {
  choices: {
    delta: {
      content: string;
    };
  }[];
}

export interface ModelInfo {
  id: string;
  object: string;
  created: number;
  owned_by: string;
}

export async function getModelInfo(serverUrl: string, apiKey: string): Promise<ModelInfo | boolean> {
  try {
    const response = await fetch(`${serverUrl}/v1/model`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
      },
    });

    if (!response.ok) {
      return false;
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking server status:', error);
    return false;
  }
}

export async function sendConversation(
  serverUrl: string,
  apiKey: string,
  messages: MessageProps[],
  userMessage: string,
  regenerate: boolean = false,
  onUpdate: (updatedMessages: MessageProps[]) => void,
  onComplete: (finalMessages: MessageProps[]) => void
) {
  try {
    let updatedMessages: MessageProps[];
    if (regenerate) {
      updatedMessages = messages.slice(0, -1); // Remove the last response
    } else {
      updatedMessages = [...messages, { role: "user", content: userMessage }];
    }

    const response = await fetch(`${serverUrl}/v1/chat/completions?stream=true`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey || '',
      },
      body: JSON.stringify({
        messages: updatedMessages,
        stream: true
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const stream = response.body;
    if (!stream) {
      throw new Error('No response body');
    }

    const reader = stream.getReader();
    const decoder = new TextDecoder('utf-8');
    updatedMessages.push({role: "assistant", content: ""});

    function processText({ done, value }: { done: boolean; value?: Uint8Array }) {
      if (done) {
        onComplete(updatedMessages);
        return;
      }

      const chunk = decoder.decode(value);
      const separateLines = chunk.split(/data: /g);
      
      separateLines.forEach(line => {
        if (line.trim() === "[DONE]") {
          return;
        }
        if (line.trim()) {
          try {
            const data: TabbyAPIResponse = JSON.parse(line);
            if (data.choices[0].delta.content) {
              updatedMessages[updatedMessages.length - 1].content += data.choices[0].delta.content;
              onUpdate([...updatedMessages]);
            }
          } catch (error) {
            console.error('Error parsing response:', error);
          }
        }
      });

      return reader.read().then(processText);
    }

    return reader.read().then(processText);
  } catch (error) {
    console.error('Error sending conversation:', error);
    throw error;
  }
}
