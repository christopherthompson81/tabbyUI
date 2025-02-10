import { usePDF } from 'react-to-pdf';
import { MessageProps } from '../services/tabbyAPI';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { PdfContent } from '../components/PdfContent';
import { ExportOptions } from './exportUtils';
export async function exportToPdf(messages: MessageProps[], options: ExportOptions = {}): Promise<void> {
    const element = document.createElement('div');
    document.body.appendChild(element);

    const { toPDF } = usePDF({
        filename: `${options.title || 'conversation'}.pdf`,
        page: { margin: 20 }
    });

    const root = ReactDOM.createRoot(element);
    // There's a linting error: PdfContent' refers to a value, but is being used as a type here. Did you mean 'typeof PdfContent'? AI!
    root.render(<PdfContent ref={element} messages={messages} options={options} />);

    try {
        await toPDF(element as unknown as React.ReactElement);
    } finally {
        root.unmount();
        document.body.removeChild(element);
    }
}
