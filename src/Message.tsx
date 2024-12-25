import React from 'react';
import './App.css';

interface MessageProps {
  role: string;
  content: string;
}

const Message: React.FC<MessageProps> = ({ role, content }) => {
  return (
    <div className={`message ${role}`}>
      <div className="message-content">{content}</div>
    </div>
  );
};

export default Message;
