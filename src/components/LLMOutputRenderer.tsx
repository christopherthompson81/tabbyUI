import * as React from "react";
import { Marked } from "marked";
import * as katex from "katex";
import "katex/dist/katex.min.css";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton, Tooltip } from '@mui/material';

const CodeBlock = ({ code, language }) => {
    const [showCopy, setShowCopy] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div 
            style={{ position: 'relative' }} 
            onMouseEnter={() => setShowCopy(true)}
            onMouseLeave={() => setShowCopy(false)}
        >
            <SyntaxHighlighter
                language={language}
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
            {showCopy && (
                <Tooltip title={copied ? "Copied!" : "Copy to clipboard"}>
                    <IconButton
                        onClick={handleCopy}
                        size="small"
                        style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            color: '#fff',
                            backgroundColor: 'rgba(0,0,0,0.3)',
                        }}
                    >
                        <ContentCopyIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            )}
        </div>
    );
};

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
        highlight: null // Disable highlight option as we'll handle it in the renderer
    });

    // Add custom tokenizers and renderers for LaTeX (lower priority)
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
                    return `<span style="border: 1px solid; padding: 0.2em;">${renderLatex(token.latex, false)}</span>`;
                },
            },
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
                return <CodeBlock code={code} language={language || "text"} />;
            },
        },
    });

    const [renderedContent, setRenderedContent] = React.useState<React.ReactNode[]>([]);

    React.useEffect(() => {
        // Remove any leading spaces before ``` but preserve the internal content indentation
        const preprocessedContent = content.replace(/^[ \t]+(```)/gm, '$1');
        const tokens = customMarked.lexer(preprocessedContent);
        const result: React.ReactNode[] = [];
        
        tokens.forEach((token: any, index: number) => {
            if (token.type === 'code') {
                // Ensure we have a valid language or fallback to text
                const language = token.lang && token.lang.trim() ? token.lang : 'text';
                result.push(
                    <CodeBlock 
                        key={index}
                        code={token.text}
                        language={language}
                    />
                );
            } else {
                const html = customMarked.parser([token]);
                result.push(
                    <div key={index} dangerouslySetInnerHTML={{ __html: html }} />
                );
            }
        });
        
        setRenderedContent(result);
    }, [content]);

    return <div className="prose max-w-none">{renderedContent}</div>;
};

export default LLMOutputRenderer;
