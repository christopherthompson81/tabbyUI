import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToPdf } from '../pdfExport';
import { MessageProps } from '../../services/tabbyAPI';
import * as ReactDOM from 'react-dom/client';
import * as PDF from 'react-to-pdf';

// Mock react-to-pdf
const mockToPDF = vi.fn().mockImplementation(() => {
    console.log('📄 Generating PDF...');
    return Promise.resolve(true);
});
vi.mock('react-to-pdf', () => ({
    usePDF: vi.fn(() => {
        console.log('🎣 usePDF hook called');
        return { toPDF: mockToPDF };
    })
}));

// Mock ReactDOM
const mockUnmount = vi.fn(() => console.log('🧹 React root unmounted'));
const mockRender = vi.fn(() => console.log('🎨 React component rendered'));
vi.mock('react-dom/client', () => ({
    createRoot: vi.fn(() => {
        console.log('🌱 React root created');
        return {
            render: mockRender,
            unmount: mockUnmount
        };
    })
}));

// Mock React hooks
vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...actual,
        useRef: vi.fn(() => {
            console.log('📌 useRef hook called');
            const div = document.createElement('div');
            console.log('📦 Created div reference');
            return { current: div };
        }),
        useEffect: vi.fn((fn) => {
            console.log('🎣 useEffect hook triggered');
            // Execute effect function and ensure promise resolution
            Promise.resolve(fn()).then(() => {
                console.log('✅ Effect function completed');
            });
        })
    };
});

// Mock LLMOutputRenderer to avoid rendering complexities
vi.mock('../components/LLMOutputRenderer', () => ({
    default: vi.fn(() => null)
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
        console.log('\n🔄 Test setup starting...');
        // Set up a mock document and React
        const div = document.createElement('div');
        document.body.appendChild(div);
        vi.spyOn(document.body, 'appendChild').mockImplementation(() => {
            console.log('➕ Element added to document.body');
            return div;
        });
        vi.spyOn(document.body, 'removeChild').mockImplementation(() => {
            console.log('➖ Element removed from document.body');
            return div;
        });
        console.log('✅ Test setup complete\n');
    });

    afterEach(() => {
        console.log('\n🧹 Cleaning up test...');
        vi.clearAllMocks();
        console.log('✅ Test cleanup complete\n');
    });

    it('should create and cleanup DOM elements correctly', async () => {
        console.log('🧪 Starting DOM elements test');
        
        console.log('📝 Creating PDF export promise...');
        const exportPromise = exportToPdf(mockMessages);
        
        console.log('⏳ Waiting for export promise to resolve...');
        await exportPromise;
        
        console.log('📄 Verifying mockToPDF was called...');
        expect(mockToPDF).toHaveBeenCalled();
        
        console.log('🔍 Verifying expectations...');
        expect(document.createElement).toHaveBeenCalledWith('div');
        expect(document.body.appendChild).toHaveBeenCalled();
        expect(mockRender).toHaveBeenCalled();
        expect(mockUnmount).toHaveBeenCalled();
        expect(document.body.removeChild).toHaveBeenCalled();
        
        console.log('✅ DOM elements test complete');
    });

    it('should handle export options correctly', async () => {
        console.log('🧪 Starting export options test');
        
        const options = {
            title: 'Test Conversation',
            author: 'Test Author',
            date: '2024-02-10'
        };
        console.log('📋 Test options:', options);

        console.log('📝 Creating PDF export promise...');
        const exportPromise = exportToPdf(mockMessages, options);
        
        console.log('⏳ Waiting for export promise to resolve...');
        await exportPromise;
        
        console.log('📄 Verifying mockToPDF was called...');
        expect(mockToPDF).toHaveBeenCalled();

        console.log('🔍 Verifying expectations...');
        expect(mockToPDF).toHaveBeenCalled();
        const { usePDF } = PDF;
        expect(usePDF).toHaveBeenCalledWith(expect.objectContaining({
            filename: 'Test Conversation.pdf'
        }));
        
        console.log('✅ Export options test complete');
    });

    it('should use default filename when no title provided', async () => {
        console.log('🧪 Starting default filename test');
        
        console.log('📝 Creating PDF export promise...');
        const exportPromise = exportToPdf(mockMessages);
        
        console.log('⏳ Waiting for export promise to resolve...');
        await exportPromise;
        
        console.log('📄 Verifying mockToPDF was called...');
        expect(mockToPDF).toHaveBeenCalled();

        console.log('🔍 Verifying expectations...');
        expect(mockToPDF).toHaveBeenCalled();
        const { usePDF } = PDF;
        expect(usePDF).toHaveBeenCalledWith(expect.objectContaining({
            filename: 'conversation.pdf'
        }));
        
        console.log('✅ Default filename test complete');
    });
});
