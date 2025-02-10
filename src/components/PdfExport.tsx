import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { MessageProps } from '../services/tabbyAPI';
// This is not exported from exportUtils. Make it exported AI!
import { ExportOptions } from '../utils/exportUtils';
import { PdfContent } from './PdfContent';

export async function exportToPdf(messages: MessageProps[], options: ExportOptions = {}): Promise<void> {
    const { usePDF } = await import('react-to-pdf');
    const element = document.createElement('div');
    document.body.appendChild(element);

    const root = ReactDOM.createRoot(element);
    root.render(<PdfContent ref={element} messages={messages} options={options} />);

    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 100));

    const { toPDF } = usePDF({
        filename: `${options.title || 'conversation'}.pdf`,
        page: { margin: 20 }
    });
    await toPDF(element);

    // Cleanup
    root.unmount();
    document.body.removeChild(element);
}
