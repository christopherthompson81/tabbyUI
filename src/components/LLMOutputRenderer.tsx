import React from "react";
import { Marked } from "marked";
import * as katex from "katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vs } from "react-syntax-highlighter/dist/esm/styles/prism";

const LLMOutputRenderer = ({ content }) => {
    // Function to render LaTeX
    const renderLatex = (latex, displayMode = false) => {
        try {
            return katex.renderToString(latex, {
                throwOnError: false,
                displayMode,
            });
        } catch (error) {
            console.error("LaTeX rendering error:", error);
            return latex;
        }
    };

    // Create a new marked instance
    const customMarked = new Marked();

    // Add custom tokenizers and renderers for LaTeX
    customMarked.use({
        extensions: [
            // Inline LaTeX
            {
                name: "inlineLatex",
                level: "inline",
                start(src) {
                    return Math.min(
                        src.indexOf("$") !== -1 ? src.indexOf("$") : Infinity,
                        src.indexOf("\\(") !== -1
                            ? src.indexOf("\\(")
                            : Infinity
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
                    // Check for both $$ and \[ at the start of the line
                    const match = src.match(/^(\$\$|\\\[)/);
                    return match ? 0 : -1;
                },
                tokenizer(src) {
                    // Handle $$ first
                    let match = src.match(/^\$\$([\s\S]+?)\$\$/);
                    if (match) {
                        return {
                            type: "displayLatex",
                            raw: match[0],
                            latex: match[1],
                        };
                    }

                    // Handle \[...\]
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
                    const html = renderLatex(token.latex, true);
                    return `<div class="text-center my-4">${html}</div>`;
                },
            },
        ],
        renderer: {
            code(code, language) {
                return (
                    <SyntaxHighlighter
                        language={language || "text"}
                        style={vs}
                        className="my-4"
                    >
                        {code}
                    </SyntaxHighlighter>
                );
            },
        },
    });

    // Process the content
    const processContent = (text) => {
        return customMarked.parse(text);
    };
    console.log(content, processContent(content));
    return (
        <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: processContent(content) }}
        />
    );
};

export default LLMOutputRenderer;
