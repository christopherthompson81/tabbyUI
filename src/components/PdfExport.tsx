import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { MessageProps } from '../services/tabbyAPI';
import { ExportOptions } from '../utils/exportUtils';
import { PdfContent } from './PdfContent';

// Export failed: TypeError: toPDF is not a function
// Property 'toPDF' does not exist on type 'typeof import("/home/chris/Programming/tabbyUI/node_modules/react-to-pdf/dist/types")' AI!
export async function exportToPdf(messages: MessageProps[], options: ExportOptions = {}): Promise<void> {
    const { toPDF } = await import('react-to-pdf');
    const element = document.createElement('div');
    document.body.appendChild(element);

    const root = ReactDOM.createRoot(element);
    root.render(<PdfContent ref={element} messages={messages} options={options} />);

    // Wait for content to render
    await new Promise(resolve => setTimeout(resolve, 100));

    await toPDF(element, {
        filename: `${options.title || 'conversation'}.pdf`,
        page: { margin: 20 }
    });

    // Cleanup
    root.unmount();
    document.body.removeChild(element);
}
