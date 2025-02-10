import * as React from 'react';
import { MessageProps } from '../services/tabbyAPI';
import LLMOutputRenderer from './LLMOutputRenderer';
// this export does not exist
import { ExportOptions } from '../utils/exportUtils';

interface PdfContentProps {
    messages: MessageProps[];
    options: ExportOptions;
}

export const PdfContent = React.forwardRef<HTMLDivElement, PdfContentProps>(
    ({ messages, options }, ref) => {
        return (
            <div ref={ref} style={{ padding: '40px' }}>
                {options.title && (
                    <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>
                        {options.title}
                    </h1>
                )}
                {(options.author || options.date) && (
                    <p style={{ textAlign: 'center', fontStyle: 'italic', marginBottom: '30px' }}>
                        {options.author || 'Anonymous'} - {options.date || new Date().toLocaleDateString()}
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
    }
);
