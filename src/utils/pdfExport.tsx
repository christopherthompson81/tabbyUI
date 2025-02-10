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

const PdfExporter = ({ messages, options, onComplete }: {
    messages: MessageProps[];
    options: PdfExportOptions;
    onComplete: () => void;
}) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { toPDF } = usePDF({
        filename: `${options.title || 'conversation'}.pdf`,
        page: { margin: 20 }
    });

    React.useEffect(() => {
        const generatePdf = async () => {
            console.log('📝 Starting PDF generation');
            if (containerRef.current) {
                try {
                    console.log('📄 Calling toPDF');
                    await toPDF(containerRef.current);
                    console.log('✅ PDF generation successful');
                    onComplete();
                    console.log('🎯 Completion callback executed');
                } catch (error) {
                    console.error('❌ PDF generation failed:', error);
                    throw error;
                }
            } else {
                console.warn('⚠️ Container ref is null');
            }
        };

        generatePdf().catch(error => {
            console.error('❌ generatePdf error:', error);
        });
    }, [toPDF, onComplete]);

    return <PdfContent ref={containerRef} messages={messages} options={options} />;
};

export async function exportToPdf(messages: MessageProps[], options: PdfExportOptions = {}): Promise<void> {
    return new Promise((resolve) => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = ReactDOM.createRoot(container);
        
        root.render(
            <PdfExporter 
                messages={messages} 
                options={options} 
                onComplete={() => {
                    root.unmount();
                    document.body.removeChild(container);
                    resolve();
                }}
            />
        );
    });
}
