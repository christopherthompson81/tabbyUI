import { useCallback, useState, useRef } from "react";
import { TextField, Button } from '@mui/material';
import "../styles.css";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box } from '@mui/material';

import { MessageProps } from '../services/tabbyAPI';

interface MessagePropsExtended extends MessageProps {
    onEdit: (index: number, newContent: { type: 'text', text: string }[]) => void;
    onDelete: (index: number) => void;
    index: number;
}

// I'd like to add a method to encapsulate <think></think> tags. Can you add that so that text in those tags is collapsed to a box that shows "thinking" and a token or word count, but can be expanded to see the content? AI!
function MessageComponent({ role, content, onEdit, onDelete, index }: MessagePropsExtended) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedContent, setEditedContent] = useState(
        content.find(c => c.type === 'text')?.text || ''
    );
    const editTextareaRef = useRef<HTMLTextAreaElement>(null);

    const handleMenuToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(prev => !prev);
    }, []);

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        setIsEditing(true);
    }, []);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        onDelete(index);
    }, [onDelete, index]);
    return (
        <div className={`message ${role}`}>
            <div className="menu-icon" onClick={handleMenuToggle}>
                <MoreVertIcon fontSize="small" />
            </div>
            {showMenu && (
                <div className="menu">
                    <div className="menu-item" onClick={handleEditClick}>
                        Edit
                    </div>
                    <div className="menu-item" onClick={handleDeleteClick}>
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
                                    onEdit(index, [{ type: 'text', text: editedContent }]);
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
                                    setEditedContent(content.find(c => c.type === 'text')?.text || '');
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
                                        code({ node, inline, className, children, ...props }: {
                                            node?: any;
                                            inline?: boolean;
                                            className?: string;
                                            children: React.ReactNode;
                                            [key: string]: any;
                                        }) {
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
                                    loading="lazy"
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

export default MessageComponent;
