import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import { Marked } from "marked";
import html2canvas from 'html2canvas';
import * as katex from "katex";
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import { MessageProps } from '../services/tabbyAPI';
import { PdfContent } from '../components/PdfContent';

interface ExportOptions {
    title?: string;
    author?: string;
    date?: string;
}

// Helper function to convert base64 to Uint8Array
function base64ToBuffer(base64: string): Uint8Array {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    const binaryString = window.atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
}

export async function exportToMarkdown(messages: MessageProps[], options: ExportOptions = {}): Promise<string> {
    let markdown = '';
    
    if (options.title) {
        markdown += `# ${options.title}\n\n`;
    }
    if (options.author || options.date) {
        markdown += `> ${options.author || 'Anonymous'} - ${options.date || new Date().toLocaleDateString()}\n\n`;
    }

    for (const message of messages) {
        markdown += `### ${message.role === 'user' ? 'User' : 'Assistant'}\n\n`;
        
        for (const content of message.content) {
            if (content.type === 'text') {
                markdown += `${content.text}\n\n`;
            } else if (content.type === 'image_url' && content.image_url) {
                markdown += `![Image](${content.image_url.url})\n\n`;
            }
        }
    }

    return markdown;
}

// Helper function to render LaTeX
function renderLatex(latex: string, displayMode = false): string {
    try {
        return katex.renderToString(latex, {
            throwOnError: false,
            displayMode,
        });
    } catch (error) {
        console.error("LaTeX rendering error:", error);
        return latex;
    }
}

// Create a marked instance with custom extensions
const customMarked = new Marked({
    async: false,
    gfm: true,
    breaks: true,
    pedantic: false,
});

// Add LaTeX extensions
customMarked.use({
    extensions: [
        // Boxed LaTeX
        {
            name: "boxedLatex",
            level: "inline",
            start(src) {
                return src.indexOf("\\boxed{");
            },
            tokenizer(src) {
                const rule = /^\\boxed\{([^}]+)\}/;
                const match = src.match(rule);
                if (match) {
                    return {
                        type: "boxedLatex",
                        raw: match[0],
                        latex: match[1],
                    };
                }
            },
            renderer(token) {
                return renderLatex(token.latex, false);
            },
        },
        // Inline LaTeX
        {
            name: "inlineLatex",
            level: "inline",
            start(src) {
                return Math.min(
                    src.indexOf("$") !== -1 ? src.indexOf("$") : Infinity,
                    src.indexOf("\\(") !== -1 ? src.indexOf("\\(") : Infinity
                );
            },
            tokenizer(src) {
                const rule = /^\$([^\$]+)\$|^\\\(([^\)]+)\\\)/;
                const match = src.match(rule);
                if (match) {
                    return {
                        type: "inlineLatex",
                        raw: match[0],
                        latex: match[1] || match[2],
                    };
                }
            },
            renderer(token) {
                return renderLatex(token.latex, false);
            },
        },
        // Display LaTeX
        {
            name: "displayLatex",
            level: "block",
            start(src) {
                const match = src.match(/^(\$\$|\\\[)/);
                return match ? 0 : -1;
            },
            tokenizer(src) {
                let match = src.match(/^\$\$([\s\S]+?)\$\$/);
                if (match) {
                    return {
                        type: "displayLatex",
                        raw: match[0],
                        latex: match[1],
                    };
                }
                match = src.match(/^\\\[([\s\S]+?)\\\]/);
                if (match) {
                    return {
                        type: "displayLatex",
                        raw: match[0],
                        latex: match[1],
                    };
                }
            },
            renderer(token) {
                return renderLatex(token.latex, true);
            },
        },
    ],
});

// Helper function to convert HTML to image data URL
async function htmlToImageDataUrl(html: string): Promise<string> {
    const div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = '-9999px';
    div.innerHTML = html;
    document.body.appendChild(div);

    // Add KaTeX styles inline
    const katexStyle = document.querySelector('link[href*="katex"]');
    if (katexStyle) {
        const style = document.createElement('style');
        style.textContent = Array.from(document.styleSheets)
            .filter(sheet => sheet.href && sheet.href.includes('katex'))
            .map(sheet => {
                try {
                    return Array.from(sheet.cssRules)
                        .map(rule => rule.cssText)
                        .join('\n');
                } catch (e) {
                    return '';
                }
            })
            .join('\n');
        div.appendChild(style);
    }

    const canvas = await html2canvas(div, {
        backgroundColor: null,
        scale: 2,
        logging: false,
        allowTaint: true,
        useCORS: true,
        onclone: (clonedDoc) => {
            // Ensure KaTeX styles are applied in the cloned document
            Array.from(clonedDoc.getElementsByClassName('katex'))
                .forEach(el => {
                    el.style.fontFamily = 'KaTeX_Main';
                });
        }
    });
    document.body.removeChild(div);
    return canvas.toDataURL('image/png');
}

export async function exportToDocx(messages: MessageProps[], options: ExportOptions = {}): Promise<Blob> {
    // Process all content first
    const processedContent = await Promise.all(messages.map(async message => {
        const messageContent = [
            // Message header
            new Paragraph({
                children: [
                    new TextRun({ 
                        text: message.role === 'user' ? 'User' : 'Assistant',
                        bold: true,
                        size: 24,
                    }),
                ],
            })
        ];

        // Process each content item
        for (const content of message.content) {
            if (content.type === 'text') {
                const tokens = customMarked.lexer(content.text);
                for (const token of tokens) {
                    if (token.type === 'code') {
                        messageContent.push(new Paragraph({
                            children: [
                                new TextRun({
                                    text: token.text,
                                    font: 'Consolas',
                                    size: 20,
                                })
                            ],
                            spacing: { before: 240, after: 240 },
                        }));
                    } else if (token.type === 'inlineLatex' || token.type === 'displayLatex' || token.type === 'boxedLatex') {
                        const latex = token.latex || token.text;
                        const rendered = renderLatex(latex, token.type === 'displayLatex');
                        const imageDataUrl = await htmlToImageDataUrl(rendered);
                        const imageData = base64ToBuffer(imageDataUrl.split(',')[1]);
                        
                        messageContent.push(new Paragraph({
                            children: [
                                new ImageRun({
                                    data: imageData,
                                    transformation: {
                                        width: 200,
                                        height: 50,
                                    },
                                }),
                            ],
                            alignment: token.type === 'displayLatex' ? 'center' : 'left',
                        }));
                    } else {
                        const html = customMarked.parser([token]);
                        const text = html.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, match => {
                            const div = document.createElement('div');
                            div.innerHTML = match;
                            return div.textContent || match;
                        });
                        messageContent.push(new Paragraph({
                            children: [new TextRun({ text })],
                        }));
                    }
                }
            } else if (content.type === 'image_url' && content.image_url) {
                messageContent.push(new Paragraph({
                    children: [
                        new ImageRun({
                            data: base64ToBuffer(content.image_url.url),
                            transformation: {
                                width: 400,
                                height: 300,
                            },
                        }),
                    ],
                }));
            }
        }
        return messageContent;
    }));

    // Create document with processed content
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // Title
                ...(options.title ? [
                    new Paragraph({
                        children: [new TextRun({ text: options.title, bold: true, size: 32 })],
                    }),
                ] : []),
                
                // Metadata
                ...(options.author || options.date ? [
                    new Paragraph({
                        children: [
                            new TextRun({ 
                                text: `${options.author || 'Anonymous'} - ${options.date || new Date().toLocaleDateString()}`,
                                italics: true,
                            }),
                        ],
                    }),
                ] : []),

                // Flattened processed content
                ...processedContent.flat()
            ],
        }],
    });

    return await Packer.toBlob(doc);
}

// This still has issues because it's not a tsx file. move the exportToPdf function to a src/components file on its own and then import it into SaveConversationDialog separately AI!
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
