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
    const element = document.createElement('div');
    document.body.appendChild(element);

    const { toPDF } = usePDF({
        filename: `${options.title || 'conversation'}.pdf`,
        page: { margin: 20 }
    });

    const root = ReactDOM.createRoot(element);
    root.render(<PdfContent ref={element} messages={messages} options={options} />);

    try {
        // There is a linting error: Type 'ReactElement<any, string | JSXElementConstructor<any>>' has no properties in common with type 'Options'. AI!
        await toPDF(element as unknown as React.ReactElement);
    } finally {
        root.unmount();
        document.body.removeChild(element);
    }
}
