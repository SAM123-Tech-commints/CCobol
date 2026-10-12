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
          <code
            key={key++}
            className="rounded bg-indigo-50 px-1.5 py-0.5 font-mono text-[0.85em] font-semibold text-indigo-700 ring-1 ring-indigo-100 dark:bg-indigo-500/15 dark:text-[#6aa1ff] dark:ring-indigo-400/20"
          >
            {token.slice(1, -1)}
          </code>,
        );
      } else if (token.startsWith("**")) {
        out.push(
          <strong key={key++} className="font-bold text-slate-900 dark:text-white">
            {token.slice(2, -2)}
          </strong>,
        );
      } else {
        const label = token.slice(1, token.indexOf("]"));
        const href = token.slice(token.indexOf("](") + 2, -1);
        out.push(
          <a key={key++} href={href} className="font-medium text-indigo-600 underline decoration-indigo-300 underline-offset-2 hover:text-indigo-800 dark:text-[#8db8ff] dark:decoration-indigo-400/40">
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
          <h2
            key={key++}
            className="mb-4 mt-12 scroll-mt-20 border-b border-slate-200 pb-2.5 text-2xl font-bold tracking-tight text-slate-900 dark:border-[#243652] dark:text-white"
          >
            {inline(text)}
          </h2>,
        );
      } else if (level === 3) {
        blocks.push(
          <h3 key={key++} className="mb-3 mt-10 scroll-mt-20 text-xl font-semibold text-slate-900 dark:text-white">
            {inline(text)}
          </h3>,
        );
      } else {
        blocks.push(
          <h4 key={key++} className="mb-2 mt-7 text-base font-semibold text-slate-800 dark:text-slate-200">
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
        ListTag === "ol" ? (
          <ol
            key={key++}
            className="my-4 list-decimal space-y-1.5 pl-6 text-[15px] leading-relaxed text-slate-700 marker:font-semibold marker:text-indigo-500 dark:text-slate-300"
          >
            {items.map((item, idx) => (
              <li key={idx}>{inline(item)}</li>
            ))}
          </ol>
        ) : (
          <ul
            key={key++}
            className="my-4 list-disc space-y-1.5 pl-6 text-[15px] leading-relaxed text-slate-700 marker:text-indigo-400 dark:text-slate-300"
          >
            {items.map((item, idx) => (
              <li key={idx}>{inline(item)}</li>
            ))}
          </ul>
        ),
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
      <p key={key++} className="my-4 text-[15px] leading-relaxed text-slate-700 dark:text-slate-300">
        {inline(para.join(" "))}
      </p>,
    );
  }

  return <div className="markdown">{blocks}</div>;
}
