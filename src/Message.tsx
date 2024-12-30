import { useState } from "react";
import "./styles.css";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export interface MessageProps {
  role: string;
  content: string;
}

const Message: React.FC<MessageProps> = ({ role, content }) => {
  const [showMenu, setShowMenu] = useState(false);
  return (
    <div className={`message ${role}`}>
      <div className="menu-icon" onClick={(e) => {
        e.stopPropagation();
        setShowMenu(!showMenu);
      }}>
        <MoreVertIcon fontSize="small" />
      </div>
      {showMenu && (
        <div className="menu">
          <div className="menu-item" onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
            // TODO: Implement edit functionality
            console.log('Edit message:', content);
          }}>
            Edit
          </div>
          <div className="menu-item" onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
            // TODO: Implement delete functionality
            console.log('Delete message');
          }}>
            Delete
          </div>
        </div>
      )}
      <div className="message-role">
        <strong>{role === "user" ? "You" : "Assistant"}</strong>
      </div>
      <div className="message-content">
        <ReactMarkdown
          components={{
            code({ node, inline, className, children, ...props }) {
              const match = /language-(\w+)/.exec(className || '');
              return !inline && match ? (
                <SyntaxHighlighter
                  children={String(children).replace(/\n$/, '')}
                  style={oneDark}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                />
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};

export default Message;
