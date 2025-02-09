import * as React from "react";
import * as ReactDOM from "react-dom";
import { Marked } from "marked";
import * as katex from "katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

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

    // Create a new marked instance with syntax highlighting priority
    const customMarked = new Marked({
        async: false,
        gfm: true,
        breaks: true,
        pedantic: false,
    });

    // Configure code block rendering first (higher priority)
    customMarked.setOptions({
        highlight: function(code, lang) {
            if (lang && SyntaxHighlighter.supportedLanguages.includes(lang)) {
                return SyntaxHighlighter.highlight(code, {
                    language: lang,
                    style: vscDarkPlus,
                    showLineNumbers: true,
                    wrapLines: true,
                });
            }
            return code;
        }
    });

    // Add custom tokenizers and renderers for LaTeX (lower priority)
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
                        style={vscDarkPlus}
                        showLineNumbers={true}
                        wrapLines={true}
                        customStyle={{
                            margin: '1em 0',
                            padding: '1em',
                            borderRadius: '4px',
                            fontSize: '0.9em',
                        }}
                    >
                        {code}
                    </SyntaxHighlighter>
                );
            },
        },
    });

    // Process the content
    const processContent = (text) => {
        const html = customMarked.parse(text);
        // Create a temporary container
        const temp = document.createElement('div');
        temp.innerHTML = html;
        
        // Replace code blocks with React components
        const codeBlocks = temp.getElementsByTagName('pre');
        Array.from(codeBlocks).forEach((pre) => {
            const code = pre.getElementsByTagName('code')[0];
            if (code) {
                const language = code.className.replace('language-', '');
                const content = code.textContent || '';
                const highlightedCode = (
                    <SyntaxHighlighter
                        language={language || "text"}
                        style={vscDarkPlus}
                        showLineNumbers={true}
                        wrapLines={true}
                        customStyle={{
                            margin: '1em 0',
                            padding: '1em',
                            borderRadius: '4px',
                            fontSize: '0.9em',
                        }}
                    >
                        {content}
                    </SyntaxHighlighter>
                );
                pre.outerHTML = `<div class="syntax-highlighter-placeholder" data-content="${encodeURIComponent(content)}" data-language="${language}"></div>`;
            }
        });
        
        return temp.innerHTML;
    };

    // Create a ref for the container
    const containerRef = React.useRef<HTMLDivElement>(null);

    // Effect to replace placeholders with React components
    React.useEffect(() => {
        if (containerRef.current) {
            const placeholders = containerRef.current.getElementsByClassName('syntax-highlighter-placeholder');
            Array.from(placeholders).forEach((placeholder) => {
                const div = placeholder as HTMLElement;
                const content = decodeURIComponent(div.dataset.content || '');
                const language = div.dataset.language || '';
                
                const root = document.createElement('div');
                div.parentNode?.replaceChild(root, div);
                
                const highlightedCode = (
                    <SyntaxHighlighter
                        language={language || "text"}
                        style={vscDarkPlus}
                        showLineNumbers={true}
                        wrapLines={true}
                        customStyle={{
                            margin: '1em 0',
                            padding: '1em',
                            borderRadius: '4px',
                            fontSize: '0.9em',
                        }}
                    >
                        {content}
                    </SyntaxHighlighter>
                );
                
                ReactDOM.render(highlightedCode, root);
            });
        }
    }, [content]);

    return (
        <div
            ref={containerRef}
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: processContent(content) }}
        />
    );
};

export default LLMOutputRenderer;
