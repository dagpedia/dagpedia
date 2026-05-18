import { Fragment } from "react";
import { DagViewer } from "@/components/dag/DagViewer";

type MarkdownBodyProps = {
  body: string;
  renderDagitty?: boolean;
};

type Block =
  | { type: "markdown"; content: string }
  | { type: "dagitty"; content: string };

function splitBlocks(body: string): Block[] {
  const blocks: Block[] = [];
  const regex = /```dagitty\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(body)) !== null) {
    if (match.index > lastIndex) {
      blocks.push({
        type: "markdown",
        content: body.slice(lastIndex, match.index),
      });
    }
    blocks.push({ type: "dagitty", content: match[1].trim() });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < body.length) {
    blocks.push({ type: "markdown", content: body.slice(lastIndex) });
  }

  return blocks;
}

function renderMarkdown(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];
  let key = 0;

  const flushList = () => {
    if (listItems.length === 0) return;
    elements.push(
      <ul key={key++} className="mb-4 list-disc space-y-1 pl-6">
        {listItems.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    );
    listItems = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      flushList();
      continue;
    }
    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h2 key={key++} className="mb-3 mt-8 text-xl font-semibold text-slate-900">
          {trimmed.slice(3)}
        </h2>
      );
      continue;
    }
    if (trimmed.startsWith("- ")) {
      listItems.push(trimmed.slice(2));
      continue;
    }
    flushList();
    elements.push(
      <p key={key++} className="mb-4 leading-relaxed text-slate-700">
        {trimmed}
      </p>
    );
  }
  flushList();
  return elements;
}

export function MarkdownBody({ body, renderDagitty = false }: MarkdownBodyProps) {
  const blocks = splitBlocks(body);

  return (
    <div className="prose-dagpedia">
      {blocks.map((block, i) => {
        if (block.type === "dagitty") {
          if (renderDagitty) {
            return <DagViewer key={i} dagittyString={block.content} />;
          }
          return (
            <pre
              key={i}
              className="mb-6 overflow-x-auto rounded-lg bg-slate-100 p-4 text-sm"
            >
              <code>{block.content}</code>
            </pre>
          );
        }
        return <Fragment key={i}>{renderMarkdown(block.content)}</Fragment>;
      })}
    </div>
  );
}
