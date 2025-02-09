import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';
import PDFDocument from 'pdfkit';
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
                            return [new Paragraph({
                                children: [new TextRun({ text: content.text })],
                            })];
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
