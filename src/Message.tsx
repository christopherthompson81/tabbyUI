import { useState, useRef } from "react";
import { TextField, Button } from '@mui/material';
import "./styles.css";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box } from '@mui/material';

import { MessageContent } from '../services/tabbyAPI';

export interface MessageProps {
  role: string;
  content: MessageContent[];
}

interface MessagePropsExtended extends MessageProps {
  onEdit: (index: number, newContent: string) => void;
  onDelete: (index: number) => void;
  index: number;
}

const Message: React.FC<MessagePropsExtended> = ({ role, content, onEdit, onDelete, index }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);
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
            setIsEditing(true);
            setShowMenu(false);
          }}>
            Edit
          </div>
          <div className="menu-item" onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
            onDelete(index);
          }}>
            Delete
          </div>
        </div>
      )}
      <div className="message-role">
        <strong>{role === "user" ? "You" : "Assistant"}</strong>
      </div>
      <div className="message-content">
        {isEditing ? (
          <div>
            <TextField
              fullWidth
              multiline
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              inputRef={editTextareaRef}
              autoFocus
            />
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="contained"
                onClick={() => {
                  onEdit(index, editedContent);
                  setIsEditing(false);
                }}
                sx={{ mr: 1 }}
              >
                Save
              </Button>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(content);
                }}
              >
                Cancel
              </Button>
            </Box>
          </div>
        ) : (
          content.map((item, idx) => {
            if (item.type === 'text') {
              return (
                <ReactMarkdown
                  key={idx}
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
                  {item.text || ''}
                </ReactMarkdown>
              );
            } else if (item.type === 'image_url' && item.image_url) {
              return (
                <img 
                  key={idx}
                  src={item.image_url.url} 
                  alt="User uploaded" 
                  style={{ maxWidth: '100%', margin: '10px 0' }}
                />
              );
            }
            return null;
          })
        )}
      </div>
    </div>
  );
};

export default Message;
