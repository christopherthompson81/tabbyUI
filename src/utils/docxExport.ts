import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { MessageProps } from '../services/tabbyAPI';
import { marked } from 'marked';

interface DocxExportOptions {
    title?: string;
    author?: string;
    date?: string;
}

export async function exportToDocx(messages: MessageProps[], options: DocxExportOptions = {}): Promise<Blob> {
    // Process all content first
    const processedContent = await Promise.all(messages.map(async message => {
        const messageContent = [
            // Message header
            new Paragraph({
                children: [
                    new TextRun({ 
                        text: message.role === 'user' ? 'User' : 'Assistant',
                        bold: true,
                        size: 28,
                    }),
                ],
                spacing: { before: 400, after: 200 }
            })
        ];

        // Process each content item
        for (const content of message.content) {
            if (content.type === 'text') {
                // Parse markdown content
                const tokens = marked.lexer(content.text || '');
                for (const token of tokens) {
                    if (token.type === 'paragraph') {
                        messageContent.push(new Paragraph({
                            children: [new TextRun({ text: token.text })],
                            spacing: { before: 200, after: 200 }
                        }));
                    } else if (token.type === 'code') {
                        messageContent.push(new Paragraph({
                            children: [new TextRun({ 
                                text: token.text,
                                font: 'Consolas',
                                size: 20
                            })],
                            spacing: { before: 200, after: 200 }
                        }));
                    }
                }
            }
        }
        return messageContent;
    }));

    // Create document
    const doc = new Document({
        sections: [{
            properties: {},
            children: [
                // Title
                ...(options.title ? [
                    new Paragraph({
                        text: options.title,
                        heading: HeadingLevel.TITLE,
                        spacing: { after: 400 }
                    })
                ] : []),
                
                // Metadata
                ...(options.author || options.date ? [
                    new Paragraph({
                        children: [
                            new TextRun({ 
                                text: `${options.author || 'Anonymous'} - ${options.date || new Date().toLocaleDateString()}`,
                                italics: true
                            })
                        ],
                        spacing: { after: 400 }
                    })
                ] : []),

                // Conversation content
                ...processedContent.flat()
            ]
        }]
    });

    // Generate blob
    return await Packer.toBlob(doc);
}
