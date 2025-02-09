import ReactMarkdown from "react-markdown";
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MathRendererProps {
    content: string;
}

const MathRenderer = ({ content }: MathRendererProps) => {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
                code({node, inline, className, children, ...props}) {
                    const match = /language-(\w+)/.exec(className || '');
                    const content = String(children);

                    // Handle display math patterns
                    const displayMathMatch = content.match(/\\?\[([^\]]*?)\\?\]/);
                    if (displayMathMatch) {
                        return (
                            <div className="display-math">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {displayMathMatch[1]} {/* Use captured math content */}
                                </ReactMarkdown>
                            </div>
                        );
                    }

                    // Handle inline LaTeX patterns
                    if (inline && content.match(/\\(frac|sqrt|text|sum|prod|int)/)) {
                        return (
                            <span className="inline-math">
                                <ReactMarkdown
                                    remarkPlugins={[remarkMath]}
                                    rehypePlugins={[rehypeKatex]}
                                >
                                    {`$${content}$`}
                                </ReactMarkdown>
                            </span>
                        );
                    }
                    
                    return !inline && match ? (
                        <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                        >
                            {content.replace(/\n$/, '')}
                        </SyntaxHighlighter>
                    ) : (
                        <code className={className} {...props}>
                            {children}
                        </code>
                    );
                }
            }}
        >
            {content}
        </ReactMarkdown>
    );
};

export default MathRenderer;
