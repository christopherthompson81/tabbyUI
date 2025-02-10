import { usePDF } from 'react-to-pdf';
import { MessageProps } from '../services/tabbyAPI';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import LLMOutputRenderer from '../components/LLMOutputRenderer';

interface PdfExportOptions {
    title?: string;
    author?: string;
    date?: string;
}

const PdfContent = React.forwardRef<HTMLDivElement, { messages: MessageProps[], options: PdfExportOptions }>(
    ({ messages, options }, ref) => {
        return (
            <div ref={ref} style={{ padding: '40px', fontFamily: 'Arial, sans-serif' }}>
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

export async function exportToPdf(messages: MessageProps[], options: PdfExportOptions = {}): Promise<void> {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { toPDF } = usePDF({
        filename: `${options.title || 'conversation'}.pdf`,
        page: { margin: 20 }
    });

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = ReactDOM.createRoot(container);
    
    root.render(<PdfContent ref={containerRef} messages={messages} options={options} />);

    try {
        if (containerRef.current) {
            await toPDF(containerRef.current);
        }
    } finally {
        root.unmount();
        document.body.removeChild(container);
    }
}
