import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import { Marked } from "marked";
import * as katex from "katex";
import { MessageProps } from '../services/tabbyAPI';

interface ExportOptions {
    title?: string;
    author?: string;
    date?: string;
}

// Helper function to convert base64 to buffer
function base64ToBuffer(base64: string): Buffer {
    const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');
    return Buffer.from(base64Data, 'base64');
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

    const canvas = await html2canvas(div, {
        backgroundColor: null,
        scale: 2
    });
    document.body.removeChild(div);
    return canvas.toDataURL('image/png');
}

export async function exportToDocx(messages: MessageProps[], options: ExportOptions = {}): Promise<Blob> {
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

                // Messages
                ...messages.flatMap(message => [
                    new Paragraph({
                        children: [
                            new TextRun({ 
                                text: message.role === 'user' ? 'User' : 'Assistant',
                                bold: true,
                                size: 24,
                            }),
                        ],
                    }),
                    ...message.content.flatMap(content => {
                        if (content.type === 'text') {
                            // Parse the content with marked
                            const tokens = customMarked.lexer(content.text);
                            const paragraphs = [];

                            for (const token of tokens) {
                                if (token.type === 'code') {
                                    paragraphs.push(new Paragraph({
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
                                    
                                    paragraphs.push(new Paragraph({
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
                                    // Remove HTML tags and convert entities
                                    const text = html.replace(/<[^>]+>/g, '').replace(/&[^;]+;/g, match => {
                                        const div = document.createElement('div');
                                        div.innerHTML = match;
                                        return div.textContent || match;
                                    });
                                    paragraphs.push(new Paragraph({
                                        children: [new TextRun({ text })],
                                    }));
                                }
                            }
                            return paragraphs;
                        } else if (content.type === 'image_url' && content.image_url) {
                            return [new Paragraph({
                                children: [
                                    new ImageRun({
                                        data: base64ToBuffer(content.image_url.url),
                                        transformation: {
                                            width: 400,
                                            height: 300,
                                        },
                                    }),
                                ],
                            })];
                        }
                        return [];
                    }),
                ]),
            ],
        }],
    });

    return await Packer.toBlob(doc);
}

export async function exportToPdf(messages: MessageProps[], options: ExportOptions = {}): Promise<string> {
    // Create HTML content for PDF
    let html = '<html><head><style>';
    html += `
        body { font-family: Arial, sans-serif; margin: 40px; }
        .title { font-size: 24px; text-align: center; margin-bottom: 20px; }
        .metadata { font-style: italic; text-align: center; margin-bottom: 30px; }
        .message { margin-bottom: 20px; }
        .role { font-weight: bold; font-size: 16px; margin-bottom: 10px; }
        .content { margin-left: 20px; }
        img { max-width: 400px; display: block; margin: 10px auto; }
    `;
    html += '</style></head><body>';

    if (options.title) {
        html += `<div class="title">${options.title}</div>`;
    }
    if (options.author || options.date) {
        html += `<div class="metadata">${options.author || 'Anonymous'} - ${options.date || new Date().toLocaleDateString()}</div>`;
    }

    messages.forEach(message => {
        html += '<div class="message">';
        html += `<div class="role">${message.role === 'user' ? 'User' : 'Assistant'}</div>`;
        html += '<div class="content">';
        message.content.forEach(content => {
            if (content.type === 'text') {
                html += `<p>${content.text.replace(/\n/g, '<br>')}</p>`;
            } else if (content.type === 'image_url' && content.image_url) {
                html += `<img src="${content.image_url.url}" alt="Conversation image">`;
            }
        });
        html += '</div></div>';
    });

    html += '</body></html>';
    return html;
}
