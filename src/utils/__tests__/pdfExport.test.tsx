import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToPdf } from '../pdfExport';
import { MessageProps } from '../../services/tabbyAPI';
import * as ReactDOM from 'react-dom/client';
import * as PDF from 'react-to-pdf';

// Mock react-to-pdf
vi.mock('react-to-pdf', () => ({
    usePDF: vi.fn(() => ({
        toPDF: vi.fn().mockResolvedValue(undefined)
    }))
}));

// Mock ReactDOM
vi.mock('react-dom/client', () => ({
    createRoot: vi.fn(() => ({
        render: vi.fn(),
        unmount: vi.fn()
    }))
}));

describe('exportToPdf', () => {
    const mockMessages: MessageProps[] = [
        {
            role: 'user',
            content: [{ type: 'text', text: 'Hello' }]
        },
        {
            role: 'assistant',
            content: [{ type: 'text', text: 'Hi there!' }]
        }
    ];

    beforeEach(() => {
        // Set up a mock document and React
        const div = document.createElement('div');
        document.body.appendChild(div);
        vi.spyOn(document.body, 'appendChild');
        vi.spyOn(document.body, 'removeChild');
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it('should create and cleanup DOM elements correctly', async () => {
        await exportToPdf(mockMessages);

        expect(document.createElement).toHaveBeenCalledWith('div');
        expect(document.body.appendChild).toHaveBeenCalled();
        expect(ReactDOM.createRoot).toHaveBeenCalled();
        expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should handle export options correctly', async () => {
        const options = {
            title: 'Test Conversation',
            author: 'Test Author',
            date: '2024-02-10'
        };

        await exportToPdf(mockMessages, options);

        const { usePDF } = PDF;
        expect(usePDF).toHaveBeenCalledWith(expect.objectContaining({
            filename: 'Test Conversation.pdf'
        }));
    });

    it('should use default filename when no title provided', async () => {
        await exportToPdf(mockMessages);

        const { usePDF } = PDF;
        expect(usePDF).toHaveBeenCalledWith(expect.objectContaining({
            filename: 'conversation.pdf'
        }));
    });
});
