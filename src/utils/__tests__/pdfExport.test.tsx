import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportToPdf } from '../pdfExport';
import { MessageProps } from '../../services/tabbyAPI';
import * as ReactDOM from 'react-dom/client';

// Mock window.open and print
const mockPrint = vi.fn(() => console.log('🖨️ Print dialog opened'));
const mockWrite = vi.fn();
const mockGetElement = vi.fn(() => document.createElement('div'));

const mockWindow = {
    print: mockPrint,
    document: {
        write: mockWrite,
        getElementById: mockGetElement
    }
};

vi.spyOn(window, 'open').mockImplementation(() => mockWindow as any);

// Mock ReactDOM
const mockRender = vi.fn(() => console.log('🎨 React component rendered'));
vi.mock('react-dom/client', () => ({
    createRoot: vi.fn(() => {
        console.log('🌱 React root created');
        return {
            render: mockRender
        };
    })
}));

// Mock React hooks
vi.mock('react', async () => {
    const actual = await vi.importActual('react');
    return {
        ...actual,
        useEffect: vi.fn((fn) => {
            console.log('🎣 useEffect hook triggered');
            fn();
            console.log('✅ Effect function executed');
        })
    };
});

// Mock LLMOutputRenderer to avoid rendering complexities
vi.mock('../components/LLMOutputRenderer', () => ({
    default: vi.fn(() => null)
}));

// Mock PrintPreview component
vi.mock('../components/PrintPreview', () => ({
    PrintPreview: vi.fn(({ messages, title, author, date }) => {
        console.log('🖨️ PrintPreview rendered with:', { messages, title, author, date });
        return null;
    })
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
        vi.clearAllMocks();
        console.log('✅ Test setup complete\n');
    });

    afterEach(() => {
        console.log('\n🧹 Cleaning up test...');
        vi.clearAllMocks();
        console.log('✅ Test cleanup complete\n');
    });

    it('should open print preview window and render content', () => {
        console.log('🧪 Starting print preview test');
        
        exportToPdf(mockMessages);
        
        console.log('🔍 Verifying window.open was called');
        expect(window.open).toHaveBeenCalledWith('', '_blank');
        
        console.log('🔍 Verifying document setup');
        expect(mockWrite).toHaveBeenCalledWith(expect.stringContaining('<title>Conversation</title>'));
        expect(mockWrite).toHaveBeenCalledWith(expect.stringContaining('<div id="root"></div>'));
        
        console.log('🔍 Verifying React rendering');
        expect(ReactDOM.createRoot).toHaveBeenCalled();
        expect(mockRender).toHaveBeenCalled();
        
        console.log('✅ Print preview test complete');
    });

    it('should handle export options in preview', () => {
        console.log('🧪 Starting options test');
        
        const options = {
            title: 'Test Conversation',
            author: 'Test Author',
            date: '2024-02-10'
        };
        
        exportToPdf(mockMessages, options);
        
        console.log('🔍 Verifying title in document');
        expect(mockWrite).toHaveBeenCalledWith(
            expect.stringContaining('<title>Test Conversation</title>')
        );
        
        console.log('🔍 Verifying React rendering with options');
        expect(mockRender).toHaveBeenCalledWith(
            expect.objectContaining({
                props: expect.objectContaining({
                    title: 'Test Conversation',
                    author: 'Test Author',
                    date: '2024-02-10'
                })
            })
        );
        
        console.log('✅ Options test complete');
    });

    it('should handle window.open failure', () => {
        console.log('🧪 Starting error handling test');
        
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(window, 'open').mockReturnValue(null);
        
        exportToPdf(mockMessages);
        
        console.log('🔍 Verifying error handling');
        expect(consoleSpy).toHaveBeenCalledWith('Failed to open print window');
        expect(mockWrite).not.toHaveBeenCalled();
        expect(mockRender).not.toHaveBeenCalled();
        
        console.log('✅ Error handling test complete');
        consoleSpy.mockRestore();
    });
});
