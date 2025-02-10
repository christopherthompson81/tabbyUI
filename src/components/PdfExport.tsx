import { usePDF } from 'react-to-pdf';
import { MessageProps } from '../services/tabbyAPI';
import { ExportOptions } from '../utils/exportUtils';
import { PdfContent } from './PdfContent';
import { createRoot } from 'react-dom/client';

export async function exportToPdf(messages: MessageProps[], options: ExportOptions = {}): Promise<void> {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const { toPDF } = usePDF({
        filename: `${options.title || 'conversation'}.pdf`,
        page: { margin: 20 }
    });
    await toPDF(element as unknown as React.ReactElement);

    // Cleanup
    root.unmount();
    document.body.removeChild(element);
}
