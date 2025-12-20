"use client";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface CodeViewerProps {
  code: string;
  language?: string;
}

export function CodeViewer({ code, language = "javascript" }: CodeViewerProps) {
  return (
    <ScrollArea className="h-full w-full rounded-md border bg-zinc-950">
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: "1.5rem",
          backgroundColor: "transparent",
        }}
        showLineNumbers={true}
      >
        {code}
      </SyntaxHighlighter>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}
