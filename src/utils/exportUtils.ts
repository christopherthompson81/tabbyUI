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

export async function exportToDocx(messages: MessageProps[], options: ExportOptions = {}): Promise<Buffer> {
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

    return await Packer.toBuffer(doc);
}

export async function exportToPdf(messages: MessageProps[], options: ExportOptions = {}): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const doc = new PDFDocument();
        
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Title
        if (options.title) {
            doc.fontSize(24).text(options.title, { align: 'center' });
            doc.moveDown();
        }

        // Metadata
        if (options.author || options.date) {
            doc.fontSize(12)
               .text(`${options.author || 'Anonymous'} - ${options.date || new Date().toLocaleDateString()}`, 
                     { align: 'center', italic: true });
            doc.moveDown();
        }

        // Messages
        messages.forEach(message => {
            doc.fontSize(16)
               .text(message.role === 'user' ? 'User' : 'Assistant', { bold: true });
            doc.moveDown(0.5);

            message.content.forEach(async content => {
                if (content.type === 'text') {
                    doc.fontSize(12).text(content.text);
                    doc.moveDown();
                } else if (content.type === 'image_url' && content.image_url) {
                    try {
                        const imgBuffer = base64ToBuffer(content.image_url.url);
                        doc.image(imgBuffer, {
                            fit: [400, 300],
                            align: 'center',
                        });
                        doc.moveDown();
                    } catch (error) {
                        console.error('Error embedding image:', error);
                    }
                }
            });

            doc.moveDown();
        });

        doc.end();
    });
}
