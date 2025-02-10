import { usePDF } from 'react-to-pdf';
import { MessageProps } from '../services/tabbyAPI';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { PdfContent } from '../components/PdfContent';

interface PdfExportOptions {
    title?: string;
    author?: string;
    date?: string;
}

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
        await toPDF(element as unknown as React.ReactElement);
    } finally {
        root.unmount();
        document.body.removeChild(element);
    }
}
