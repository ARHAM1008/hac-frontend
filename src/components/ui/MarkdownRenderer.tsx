/**
 * MarkdownRenderer.tsx
 *
 * A lightweight, zero-dependency inline markdown-to-JSX renderer.
 * Handles the patterns that NyayaAI backend responses produce:
 *
 *   • ATX headings (# / ## / ###)
 *   • Bold (**text**)
 *   • Italic (*text*)
 *   • Inline code (`code`)
 *   • Fenced code blocks (```lang\ncode\n```) — with copy button
 *   • Unordered lists  (- item  or  * item)
 *   • Ordered lists    (1. item)
 *   • Horizontal rules (--- on its own line)
 *   • Plain paragraphs
 *
 * SECURITY: Never uses dangerouslySetInnerHTML. All content is rendered as
 * React text nodes or elements.
 */

import { useState, type ReactNode } from 'react';
import { Copy, Check } from 'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MarkdownRendererProps {
  content: string;
  theme?: 'dark' | 'light';
  className?: string;
}

// ─── Copy Button ──────────────────────────────────────────────────────────────

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard API unavailable (e.g., non-secure context) — silently ignore
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={copied ? 'Copied!' : 'Copy code'}
      title={copied ? 'Copied!' : 'Copy code'}
      className={`
        inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-mono
        transition-colors duration-150
        ${copied
          ? 'text-emerald-400 bg-emerald-500/10'
          : 'text-slate-400 hover:text-slate-200 hover:bg-white/10'}
      `}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
      {copied ? 'Copied' : 'Copy'}
    </button>
  );
}

// ─── Code Block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, lang, isDark }: { code: string; lang: string; isDark: boolean }) {
  return (
    <div
      className={`
        my-3 rounded-xl overflow-hidden border text-xs
        ${isDark
          ? 'bg-gray-950 border-white/10'
          : 'bg-gray-50 border-gray-200'}
      `}
    >
      {/* Header bar */}
      <div
        className={`
          flex items-center justify-between px-4 py-2 border-b
          ${isDark ? 'border-white/8 bg-gray-900/80' : 'border-gray-200 bg-gray-100'}
        `}
      >
        <span className={`font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          {lang || 'code'}
        </span>
        <CopyButton text={code} />
      </div>

      {/* Code content */}
      <pre
        className={`
          overflow-x-auto p-4 text-[13px] leading-relaxed font-mono
          ${isDark ? 'text-slate-200' : 'text-slate-800'}
        `}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

// ─── Inline text parser ───────────────────────────────────────────────────────
// Converts a single plain-text line into React elements with bold/italic/code.

function parseInline(text: string, isDark: boolean): ReactNode[] {
  const parts: ReactNode[] = [];
  // Pattern: **bold**, *italic*, `code`
  const regex = /(\*\*(.+?)\*\*|\*(.+?)\*|`([^`]+)`)/g;
  let last = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > last) {
      parts.push(text.slice(last, match.index));
    }

    if (match[2] !== undefined) {
      // **bold**
      parts.push(<strong key={match.index}>{match[2]}</strong>);
    } else if (match[3] !== undefined) {
      // *italic*
      parts.push(<em key={match.index}>{match[3]}</em>);
    } else if (match[4] !== undefined) {
      // `inline code`
      parts.push(
        <code
          key={match.index}
          className={`
            rounded px-1.5 py-0.5 font-mono text-[0.85em]
            ${isDark
              ? 'bg-white/10 text-neon-soft'
              : 'bg-gray-100 text-blue-700 border border-gray-200'}
          `}
        >
          {match[4]}
        </code>
      );
    }

    last = match.index + match[0].length;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return parts;
}

// ─── Block parser ─────────────────────────────────────────────────────────────

interface Token {
  type:
    | 'heading1' | 'heading2' | 'heading3'
    | 'hr'
    | 'ul_item' | 'ol_item'
    | 'code_block'
    | 'blank'
    | 'text';
  raw: string;
  // code_block extras
  lang?: string;
  code?: string;
  // ol_item extras
  olIndex?: number;
}

function tokenize(content: string): Token[] {
  const lines = content.split('\n');
  const tokens: Token[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // Fenced code block
    const fenceMatch = line.match(/^```(\w*)$/);
    if (fenceMatch) {
      const lang = fenceMatch[1] || '';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      tokens.push({ type: 'code_block', raw: line, lang, code: codeLines.join('\n') });
      continue;
    }

    // Headings
    const h3 = line.match(/^### (.+)/);
    if (h3) { tokens.push({ type: 'heading3', raw: h3[1] }); i++; continue; }
    const h2 = line.match(/^## (.+)/);
    if (h2) { tokens.push({ type: 'heading2', raw: h2[1] }); i++; continue; }
    const h1 = line.match(/^# (.+)/);
    if (h1) { tokens.push({ type: 'heading1', raw: h1[1] }); i++; continue; }

    // Horizontal rule
    if (/^-{3,}$/.test(line.trim()) || /^\*{3,}$/.test(line.trim())) {
      tokens.push({ type: 'hr', raw: line }); i++; continue;
    }

    // Unordered list item
    const ulMatch = line.match(/^[-*] (.+)/);
    if (ulMatch) { tokens.push({ type: 'ul_item', raw: ulMatch[1] }); i++; continue; }

    // Ordered list item
    const olMatch = line.match(/^(\d+)\. (.+)/);
    if (olMatch) {
      tokens.push({ type: 'ol_item', raw: olMatch[2], olIndex: parseInt(olMatch[1], 10) });
      i++; continue;
    }

    // Blank line
    if (line.trim() === '') {
      tokens.push({ type: 'blank', raw: '' }); i++; continue;
    }

    // Plain text
    tokens.push({ type: 'text', raw: line }); i++;
  }

  return tokens;
}

// ─── Tokens → React nodes ─────────────────────────────────────────────────────

function renderTokens(tokens: Token[], isDark: boolean): ReactNode[] {
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    if (token.type === 'code_block') {
      nodes.push(
        <CodeBlock
          key={i}
          code={token.code ?? ''}
          lang={token.lang ?? ''}
          isDark={isDark}
        />
      );
      i++;
      continue;
    }

    if (token.type === 'heading1') {
      nodes.push(
        <h2 key={i} className="mt-5 mb-2 font-display text-xl font-bold leading-tight">
          {parseInline(token.raw, isDark)}
        </h2>
      );
      i++; continue;
    }

    if (token.type === 'heading2') {
      nodes.push(
        <h3 key={i} className="mt-4 mb-1.5 font-display text-base font-semibold">
          {parseInline(token.raw, isDark)}
        </h3>
      );
      i++; continue;
    }

    if (token.type === 'heading3') {
      nodes.push(
        <h4 key={i} className="mt-3 mb-1 font-display text-sm font-semibold">
          {parseInline(token.raw, isDark)}
        </h4>
      );
      i++; continue;
    }

    if (token.type === 'hr') {
      nodes.push(
        <hr
          key={i}
          className={`my-4 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`}
        />
      );
      i++; continue;
    }

    // Collect consecutive ul_item tokens into one <ul>
    if (token.type === 'ul_item') {
      const items: Token[] = [];
      while (i < tokens.length && tokens[i].type === 'ul_item') {
        items.push(tokens[i]);
        i++;
      }
      nodes.push(
        <ul key={i} className="my-2 ml-5 list-disc space-y-0.5">
          {items.map((item, j) => (
            <li key={j} className="text-sm leading-relaxed">
              {parseInline(item.raw, isDark)}
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Collect consecutive ol_item tokens into one <ol>
    if (token.type === 'ol_item') {
      const items: Token[] = [];
      while (i < tokens.length && tokens[i].type === 'ol_item') {
        items.push(tokens[i]);
        i++;
      }
      nodes.push(
        <ol key={i} className="my-2 ml-5 list-decimal space-y-0.5">
          {items.map((item, j) => (
            <li key={j} className="text-sm leading-relaxed">
              {parseInline(item.raw, isDark)}
            </li>
          ))}
        </ol>
      );
      continue;
    }

    // Skip blank lines (they just create visual spacing via prose)
    if (token.type === 'blank') {
      i++; continue;
    }

    // Plain text — collect consecutive text lines into a paragraph
    if (token.type === 'text') {
      const lineGroup: Token[] = [];
      while (
        i < tokens.length &&
        tokens[i].type === 'text'
      ) {
        lineGroup.push(tokens[i]);
        i++;
      }
      const combined = lineGroup.map((t) => t.raw).join(' ');
      nodes.push(
        <p key={i} className="my-1.5 text-sm leading-relaxed">
          {parseInline(combined, isDark)}
        </p>
      );
      continue;
    }

    i++;
  }

  return nodes;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MarkdownRenderer({
  content,
  theme = 'dark',
  className = '',
}: MarkdownRendererProps) {
  const isDark = theme === 'dark';
  const tokens = tokenize(content);
  const nodes = renderTokens(tokens, isDark);

  return (
    <div
      className={`
        markdown-body pr-6
        ${isDark ? 'text-[#F8FAFC]' : 'text-[#111827]'}
        ${className}
      `}
    >
      {nodes}
    </div>
  );
}
