import { usePDF } from 'react-to-pdf';
import { MessageProps } from '../services/tabbyAPI';
import * as React from 'react';
import { PdfContent } from '../utils/pdfExport';
import { PdfExportOptions } from '../utils/pdfExport';

export const PdfExporter = ({ messages, options, onComplete }: {
    messages: MessageProps[];
    options: PdfExportOptions;
    onComplete: () => void;
}) => {
    console.log('🖨️ PdfExporter component mounted');
    const containerRef = React.useRef<HTMLDivElement>(null);
    const { toPDF } = usePDF({
        filename: `${options.title || 'conversation'}.pdf`,
        page: { margin: 20 }
    });

    React.useEffect(() => {
        console.log('📝 Starting PDF generation');
        const generatePdf = async () => {
            if (!containerRef.current) {
                console.warn('⚠️ Container ref is null');
                return;
            }
            try {
                console.log('📄 Calling toPDF');
                const result = await toPDF(containerRef.current);
                console.log('✅ PDF generation successful', result);
                onComplete();
                console.log('🎯 Completion callback executed');
            } catch (error) {
                console.error('❌ PDF generation failed:', error);
            }
        };

        // Execute immediately
        generatePdf();
    }, [toPDF, onComplete]);

    return <PdfContent ref={containerRef} messages={messages} options={options} />;
};
