import { MessageProps } from '../services/tabbyAPI';
import * as React from 'react';
import LLMOutputRenderer from './LLMOutputRenderer';
import 'katex/dist/katex.min.css';
import "../styles.css";

interface PrintPreviewProps {
    messages: MessageProps[];
    title?: string;
    author?: string;
    date?: string;
}

export const PrintPreview: React.FC<PrintPreviewProps> = ({ messages, title, author, date }) => {

    return (
        <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
            {title && (
                <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
                    {title}
                </h1>
            )}
            {(author || date) && (
                <p style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '30px' }}>
                    {author || 'Anonymous'} - {date || new Date().toLocaleDateString()}
                </p>
            )}
            {messages.map((message, index) => (
                <div key={index} style={{ marginBottom: '20px' }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>
                        {message.role === 'user' ? 'User' : 'Assistant'}
                    </div>
                    <div style={{ marginLeft: '20px' }}>
                        {message.content.map((content, idx) => (
                            <div key={idx}>
                                {content.type === 'text' ? (
                                    <LLMOutputRenderer content={content.text} />
                                ) : content.type === 'image_url' && content.image_url ? (
                                    <img 
                                        src={content.image_url.url} 
                                        alt="Conversation image"
                                        style={{ 
                                            maxWidth: '400px', 
                                            display: 'block', 
                                            margin: '10px auto' 
                                        }} 
                                    />
                                ) : null}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};
