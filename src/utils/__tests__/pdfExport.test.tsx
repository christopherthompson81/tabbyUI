import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToPdf } from '../pdfExport';
import { MessageProps } from '../../services/tabbyAPI';
import * as ReactDOM from 'react-dom/client';
import * as PDF from 'react-to-pdf';

// Mock react-to-pdf
const mockToPDF = vi.fn().mockResolvedValue(undefined);
vi.mock('react-to-pdf', () => ({
    usePDF: vi.fn(() => ({
        toPDF: mockToPDF
    }))
}));

// Mock ReactDOM
const mockUnmount = vi.fn();
const mockRender = vi.fn();
vi.mock('react-dom/client', () => ({
    createRoot: vi.fn(() => ({
        render: mockRender,
        unmount: mockUnmount
    }))
}));

// Mock React hooks
vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...actual,
        useRef: vi.fn((val) => ({ current: val })),
        useEffect: vi.fn((fn) => fn())
    };
});

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
        const promise = exportToPdf(mockMessages);
        await promise;

        expect(document.createElement).toHaveBeenCalledWith('div');
        expect(document.body.appendChild).toHaveBeenCalled();
        expect(mockRender).toHaveBeenCalled();
        expect(mockUnmount).toHaveBeenCalled();
        expect(document.body.removeChild).toHaveBeenCalled();
    });

    it('should handle export options correctly', async () => {
        const options = {
            title: 'Test Conversation',
            author: 'Test Author',
            date: '2024-02-10'
        };

        const promise = exportToPdf(mockMessages, options);
        await promise;

        expect(mockToPDF).toHaveBeenCalled();
        const { usePDF } = PDF;
        expect(usePDF).toHaveBeenCalledWith(expect.objectContaining({
            filename: 'Test Conversation.pdf'
        }));
    });

    it('should use default filename when no title provided', async () => {
        const promise = exportToPdf(mockMessages);
        await promise;

        expect(mockToPDF).toHaveBeenCalled();
        const { usePDF } = PDF;
        expect(usePDF).toHaveBeenCalledWith(expect.objectContaining({
            filename: 'conversation.pdf'
        }));
    });
});
