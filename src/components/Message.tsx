import { useCallback, useState, useRef } from "react";
import { TextField, Button, Typography, Collapse } from '@mui/material';
import 'katex/dist/katex.min.css';
import "../styles.css";
import ReactMarkdown from "react-markdown";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { Box } from '@mui/material';

import { MessageProps } from '../services/tabbyAPI';

// Part of the things that I want the math style to be applied to are aspects that look like the following example. Can you do that? AI!
/*
    \[
    \frac{d\Omega}{dt}_{\text{J2}} = \frac{3 G J_2 R^2}{4 a^3 (1 - e^2)^{3/2}} \cos i
    \]
*/
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
                            const text = item.text || '';
                            const thinkMatches = Array.from(text.matchAll(/<think>(.*?)<\/think>/gs));
                            
                            if (thinkMatches.length > 0) {
                                let lastIndex = 0;
                                const elements = [];
                                
                                thinkMatches.forEach((match, matchIdx) => {
                                    // Add text before the think tag
                                    if (match.index && match.index > lastIndex) {
                                        elements.push(
                                            <ReactMarkdown 
                                                key={`${idx}-${matchIdx}-pre`}
                                                remarkPlugins={[remarkMath]}
                                                rehypePlugins={[rehypeKatex]}
                                                components={{
                                                    code({node, inline, className, children, ...props}) {
                                                        const match = /language-(\w+)/.exec(className || '');
                                                        
                                                        // Handle inline LaTeX patterns
                                                        if (inline && String(children).match(/\\(frac|sqrt|text|sum|prod|int)/)) {
                                                            return (
                                                                <span className="inline-math">
                                                                    <ReactMarkdown
                                                                        remarkPlugins={[remarkMath]}
                                                                        rehypePlugins={[rehypeKatex]}
                                                                    >
                                                                        {`$${String(children)}$`}
                                                                    </ReactMarkdown>
                                                                </span>
                                                            );
                                                        }
                                                        
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                style={oneDark}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, '')}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className={className} {...props}>
                                                                {children}
                                                            </code>
                                                        );
                                                    }
                                                }}
                                            >
                                                {text.slice(lastIndex, match.index)}
                                            </ReactMarkdown>
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
                                                backgroundColor: 'action.hover',
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
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                    >
                                                        {thinkContent}
                                                    </ReactMarkdown>
                                                </Box>
                                            </Collapse>
                                        </Box>
                                    );
                                    
                                    lastIndex = (match.index || 0) + match[0].length;
                                });
                                
                                // Add any remaining text after the last think tag
                                if (lastIndex < text.length) {
                                    const remainingText = text.slice(lastIndex);
                                    const parts = remainingText.split(/(?=\\boxed{)|(?<=})/);
                                    
                                    parts.forEach((part, partIdx) => {
                                        if (part.startsWith('\\boxed{') && part.endsWith('}')) {
                                            const content = part.slice(7, -1); // Remove \boxed{ and }
                                            elements.push(
                                                <Box 
                                                    key={`${idx}-final-box-${partIdx}`}
                                                    sx={{ 
                                                        border: 1, 
                                                        borderRadius: 1, 
                                                        p: 1, 
                                                        display: 'inline-block', 
                                                        mx: 1,
                                                        borderColor: 'primary.main',
                                                        bgcolor: 'background.paper'
                                                    }}
                                                >
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkMath]}
                                                        rehypePlugins={[rehypeKatex]}
                                                    >
                                                        {content}
                                                    </ReactMarkdown>
                                                </Box>
                                            );
                                        } else if (part.trim()) {
                                            elements.push(
                                                <ReactMarkdown 
                                                    key={`${idx}-final-text-${partIdx}`}
                                                    remarkPlugins={[remarkMath]}
                                                    rehypePlugins={[rehypeKatex]}
                                                    components={{
                                                        code({node, inline, className, children, ...props}) {
                                                            const match = /language-(\w+)/.exec(className || '');
                                                            
                                                            // Handle inline LaTeX patterns
                                                            if (inline && String(children).match(/\\(frac|sqrt|text|sum|prod|int)/)) {
                                                                return (
                                                                    <span className="inline-math">
                                                                        <ReactMarkdown
                                                                            remarkPlugins={[remarkMath]}
                                                                            rehypePlugins={[rehypeKatex]}
                                                                        >
                                                                            {`$${String(children)}$`}
                                                                        </ReactMarkdown>
                                                                    </span>
                                                                );
                                                            }
                                                            
                                                            return !inline && match ? (
                                                                <SyntaxHighlighter
                                                                    style={oneDark}
                                                                    language={match[1]}
                                                                    PreTag="div"
                                                                    {...props}
                                                                >
                                                                    {String(children).replace(/\n$/, '')}
                                                                </SyntaxHighlighter>
                                                            ) : (
                                                                <code className={className} {...props}>
                                                                    {children}
                                                                </code>
                                                            );
                                                        }
                                                    }}
                                                >
                                                    {part}
                                                </ReactMarkdown>
                                            );
                                        }
                                    });
                                }
                                
                                return <>{elements}</>;
                            }
                            
                            // If no think tags, render normally
                            return (
                                <ReactMarkdown
                                    key={idx}
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                    components={{
                                        code({node, inline, className, children, ...props}) {
                                            const match = /language-(\w+)/.exec(className || '');
                                            
                                            // Handle inline LaTeX patterns
                                            if (inline && String(children).match(/\\(frac|sqrt|text|sum|prod|int)/)) {
                                                return (
                                                    <span className="inline-math">
                                                        <ReactMarkdown
                                                            remarkPlugins={[remarkMath]}
                                                            rehypePlugins={[rehypeKatex]}
                                                        >
                                                            {`$${String(children)}$`}
                                                        </ReactMarkdown>
                                                    </span>
                                                );
                                            }
                                            
                                            return !inline && match ? (
                                                <SyntaxHighlighter
                                                    style={oneDark}
                                                    language={match[1]}
                                                    PreTag="div"
                                                    {...props}
                                                >
                                                    {String(children).replace(/\n$/, '')}
                                                </SyntaxHighlighter>
                                            ) : (
                                                <code className={className} {...props}>
                                                    {children}
                                                </code>
                                            );
                                        },
                                        box: ({ children }) => (
                                            <Box 
                                                sx={{ 
                                                    border: 1, 
                                                    borderRadius: 1, 
                                                    p: 1, 
                                                    display: 'inline-block', 
                                                    mx: 1,
                                                    borderColor: 'primary.main',
                                                    bgcolor: 'background.paper'
                                                }}
                                            >
                                                {children}
                                            </Box>
                                        )
                                    }}
                                >
                                    {text}
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
