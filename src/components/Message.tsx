import { useCallback, useState, useRef, useEffect } from "react";
import { TextField, Button, Typography, Collapse } from '@mui/material';
import 'katex/dist/katex.min.css';
import "../styles.css";
import LLMOutputRenderer from './LLMOutputRenderer';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box } from '@mui/material';
import { blueGrey } from '@mui/material/colors';

import { MessageProps } from '../services/tabbyAPI';

interface MessagePropsExtended extends MessageProps {
    onEdit: (index: number, newContent: { type: 'text', text: string }[]) => void;
    onDelete: (index: number) => void;
    index: number;
}

function MessageComponent({ role, content, onEdit, onDelete, index }: MessagePropsExtended) {
    const [showMenu, setShowMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [expandedThinkTags, setExpandedThinkTags] = useState<number[]>([]);
    const [editedContent, setEditedContent] = useState(
        content.find(c => c.type === 'text')?.text || ''
    );
    const editTextareaRef = useRef<HTMLTextAreaElement>(null);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setShowMenu(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMenuToggle = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(prev => !prev);
    }, []);

    const handleEditClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        setIsEditing(true);
        setEditedContent(content.find(c => c.type === 'text')?.text || '');
    }, [content]);

    const handleDeleteClick = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setShowMenu(false);
        onDelete(index);
    }, [onDelete, index]);

    return (
        <div className={`message ${role}`}>
            <div className="menu-icon" onClick={handleMenuToggle} ref={menuRef}>
                <MoreVertIcon fontSize="small" />
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
            </div>
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
                            const text = item.text || '';
                            const thinkMatches = Array.from(text.matchAll(/<think>(.*?)<\/think>/gs));
                            
                            if (thinkMatches.length > 0) {
                                let lastIndex = 0;
                                const elements = [];
                                
                                thinkMatches.forEach((match, matchIdx) => {
                                    // Add text before the think tag
                                    if (match.index && match.index > lastIndex) {
                                        elements.push(
                                            <LLMOutputRenderer
                                                key={`${idx}-${matchIdx}-pre`}
                                                content={text.slice(lastIndex, match.index)}
                                            />
                                        );
                                    }
                                    
                                    // Add the think tag content
                                    const thinkContent = match[1];
                                    const wordCount = thinkContent.trim().split(/\s+/).length;
                                    const isExpanded = expandedThinkTags.includes(matchIdx);
                                    
                                    elements.push(
                                        <Box 
                                            key={`${idx}-${matchIdx}-think`}
                                            sx={{
                                                backgroundColor: blueGrey[100],
                                                borderRadius: 1,
                                                p: 1,
                                                my: 1,
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => {
                                                setExpandedThinkTags(prev => 
                                                    isExpanded 
                                                        ? prev.filter(i => i !== matchIdx)
                                                        : [...prev, matchIdx]
                                                );
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                {isExpanded ? '🤔 Thinking... (click to collapse)' : `🤔 Thinking... (${wordCount} words, click to expand)`}
                                            </Typography>
                                            <Collapse in={isExpanded}>
                                                <Box sx={{ mt: 1 }}>
                                                    <LLMOutputRenderer content={thinkContent} />
                                                </Box>
                                            </Collapse>
                                        </Box>
                                    );
                                    
                                    lastIndex = (match.index || 0) + match[0].length;
                                });
                                
                                // Add any remaining text after the last think tag
                                if (lastIndex < text.length) {
                                    const remainingText = text.slice(lastIndex);
                                    elements.push(
                                        <LLMOutputRenderer
                                            content={remainingText}
                                        />
                                    );
                                }
                                
                                return <>{elements}</>;
                            }
                            
                            // If no think tags, render normally
                            return (
                                <LLMOutputRenderer
                                    key={idx}
                                    content={text}
                                />
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
