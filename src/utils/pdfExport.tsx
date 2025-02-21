import { MessageProps } from "../services/tabbyAPI";
import * as ReactDOM from "react-dom/client";
import { PrintPreview } from "../components/PrintPreview";

export interface PdfExportOptions {
    title?: string;
    author?: string;
    date?: string;
}

export function exportToPdf(
    messages: MessageProps[],
    options: PdfExportOptions = {}
): void {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
        console.error("Failed to open print window");
        return;
    }

    // Add necessary styles
    printWindow.document.write(`
        <html>
            <head>
                <title>${options.title || "Conversation"}</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css" integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV" crossorigin="anonymous">
                <style>
                    @media print {
                        body { margin: 0; }
                        pre { white-space: pre-wrap; }
                    }
                </style>
            </head>
            <body>
                <div id="root"></div>
            </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    const root = ReactDOM.createRoot(
        printWindow.document.getElementById("root")!
    );
    root.render(
        <PrintPreview
            messages={messages}
            title={options.title}
            author={options.author}
            date={options.date}
        />
    );
    printWindow.print();
    //printWindow.close();
}
