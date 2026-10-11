import CodeBlock from "@/components/CodeBlock";

interface Props {
  markdown: string;
  files?: Record<string, string>;
  stdin?: string;
}

/** Renders the lesson markdown (headings, lists, bold, inline code, fenced code). */
export default function Markdown({ markdown, files = {}, stdin = "" }: Props) {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const blocks: React.ReactNode[] = [];
  let i = 0;
  let key = 0;

  const inline = (text: string): React.ReactNode[] => {
    const out: React.ReactNode[] = [];
    const regex = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)]+\))/g;
    let last = 0;
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text))) {
      if (m.index > last) out.push(text.slice(last, m.index));
      const token = m[0];
      if (token.startsWith("`")) {
        out.push(
          <code key={key++} className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.87em] text-indigo-700">
            {token.slice(1, -1)}
          </code>,
        );
      } else if (token.startsWith("**")) {
        out.push(
          <strong key={key++} className="font-semibold text-slate-900">
            {token.slice(2, -2)}
          </strong>,
        );
      } else {
        const label = token.slice(1, token.indexOf("]"));
        const href = token.slice(token.indexOf("](") + 2, -1);
        out.push(
          <a key={key++} href={href} className="font-medium text-indigo-600 underline decoration-indigo-300 hover:text-indigo-800">
            {label}
          </a>,
        );
      }
      last = m.index + token.length;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
  };

  while (i < lines.length) {
    const line = lines[i];

    // fenced code
    if (line.trimStart().startsWith("```")) {
      const info = line.trim().slice(3).trim();
      const lang = info.split(/\s+/)[0] || "text";
      const runnable = /\brun\b/.test(info);
      const body: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trimStart().startsWith("```")) {
        body.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <CodeBlock
          key={key++}
          code={body.join("\n")}
          lang={lang === "run" ? "cobol" : lang}
          runnable={runnable}
          files={files}
          stdin={stdin}
        />,
      );
      continue;
    }

    if (!line.trim()) {
      i++;
      continue;
    }

    if (/^---+$/.test(line.trim())) {
      blocks.push(<hr key={key++} className="my-8 border-slate-200" />);
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2].replace(/\*\*/g, "");
      if (level <= 2) {
        blocks.push(
          <h2 key={key++} className="mt-10 mb-4 text-2xl font-bold tracking-tight text-slate-900">
            {inline(text)}
          </h2>,
        );
      } else if (level === 3) {
        blocks.push(
          <h3 key={key++} className="mt-8 mb-3 text-lg font-bold text-slate-900">
            {inline(text)}
          </h3>,
        );
      } else {
        blocks.push(
          <h4 key={key++} className="mt-6 mb-2 text-base font-semibold text-slate-800">
            {inline(text)}
          </h4>,
        );
      }
      i++;
      continue;
    }

    // lists
    if (/^\s*[-*]\s+/.test(line) || /^\s*\d+\.\s+/.test(line)) {
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i]))) {
        items.push(lines[i].replace(/^\s*(?:[-*]|\d+\.)\s+/, ""));
        i++;
      }
      const ListTag = ordered ? "ol" : "ul";
      blocks.push(
        <ListTag
          key={key++}
          className={`my-4 space-y-1.5 pl-6 ${ordered ? "list-decimal" : "list-disc"} text-slate-700 marker:text-indigo-400`}
        >
          {items.map((item, idx) => (
            <li key={idx}>{inline(item)}</li>
          ))}
        </ListTag>,
      );
      continue;
    }

    // paragraph
    const para: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^\s*[-*]\s+/.test(lines[i]) && !/^\s*\d+\.\s+/.test(lines[i]) && !lines[i].trimStart().startsWith("```") && !/^#{1,6}\s+/.test(lines[i])) {
      para.push(lines[i]);
      i++;
    }
    blocks.push(
      <p key={key++} className="my-4 leading-relaxed text-slate-700">
        {inline(para.join(" "))}
      </p>,
    );
  }

  return <div className="markdown">{blocks}</div>;
}
