"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownRendererProps {
    content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
    return (
        <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
                code({ node, inline, className, children, ...props }: any) {
                    const match = /language-(\w+)/.exec(className || "");
                    return !inline && match ? (
                        <div className="my-4 rounded-md overflow-hidden border border-zinc-800 shadow-lg bg-zinc-950">
                            <div className="bg-zinc-900/50 px-4 py-1 border-b border-zinc-800 flex items-center justify-between">
                                <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest">{match[1]}</span>
                            </div>
                            <SyntaxHighlighter
                                language={match[1]}
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    padding: "1rem",
                                    fontSize: "0.85rem",
                                    backgroundColor: "transparent",
                                }}
                                {...props}
                            >
                                {String(children).replace(/\n$/, "")}
                            </SyntaxHighlighter>
                        </div>
                    ) : (
                        <code className="bg-zinc-900 text-emerald-400 px-1.5 py-0.5 rounded text-[0.9em] font-mono border border-zinc-800" {...props}>
                            {children}
                        </code>
                    );
                },
                h2: ({ children }) => <h2 className="text-xl font-bold text-zinc-100 mt-8 mb-4 border-b border-zinc-800 pb-2 flex items-center gap-2">{children}</h2>,
                h3: ({ children }) => <h3 className="text-lg font-bold text-zinc-200 mt-6 mb-3">{children}</h3>,
                p: ({ children }) => <p className="text-zinc-300 leading-relaxed mb-4 last:mb-0">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-2 mb-4 text-zinc-300 marker:text-emerald-500">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-2 mb-4 text-zinc-300 marker:text-emerald-500">{children}</ol>,
                li: ({ children }) => <li className="text-zinc-300">{children}</li>,
                strong: ({ children }) => <strong className="font-bold text-emerald-500/90">{children}</strong>,
                blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-emerald-500/30 bg-emerald-500/5 px-4 py-2 my-4 italic text-zinc-400 rounded-r">
                        {children}
                    </blockquote>
                ),
            }}
        >
            {content}
        </ReactMarkdown>
    );
}
