import { MessageProps } from '../services/tabbyAPI';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import LLMOutputRenderer from '../components/LLMOutputRenderer';
import { PrintPreview } from '../components/PrintPreview';

export interface PdfExportOptions {
    title?: string;
    author?: string;
    date?: string;
}

export const PdfContent = React.forwardRef<HTMLDivElement, { messages: MessageProps[], options: PdfExportOptions }>(
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


export function exportToPdf(messages: MessageProps[], options: PdfExportOptions = {}): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        console.error('Failed to open print window');
        return;
    }

    // Add necessary styles
    printWindow.document.write(`
        <html>
            <head>
                <title>${options.title || 'Conversation'}</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
                <style>
                    @media print {
                        body { margin: 0; }
                        pre { white-space: pre-wrap; }
                    }
                </style>
            </head>
            <body>
                <div id="root"></div>
            </body>
        </html>
    `);

    const root = ReactDOM.createRoot(printWindow.document.getElementById('root')!);
    root.render(
        <PrintPreview 
            messages={messages}
            title={options.title}
            author={options.author}
            date={options.date}
        />
    );
    printWindow.print();
    printWindow.close();
}
