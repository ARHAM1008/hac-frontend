import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send,
  FileText,
  MessageSquare,
  Plus,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  History as HistoryIcon,
  X,
  Globe,
} from "lucide-react";
import { api } from "@/lib/api";
import type { ChatSession, ChatMessage, Document } from "@/lib/types";
import { useTheme } from "@/context/ThemeContext";
import MarkdownRenderer from "@/components/ui/MarkdownRenderer";
import LoadingShimmer from "@/components/ui/LoadingShimmer";

type Lang = "auto" | "en" | "hi" | "mr";

const LANG_OPTIONS: { value: Lang; label: string }[] = [
  { value: "auto", label: "Auto-detect" },
  { value: "en",   label: "English"     },
  { value: "hi",   label: "हिंदी"        },
  { value: "mr",   label: "मराठी"        },
];

// ─── Message bubble animation variant ────────────────────────────────────────

const msgVariants = {
  hidden:  { opacity: 0, y: 8 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.28, ease: "easeOut" } },
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [language, setLanguage] = useState<Lang>("auto");

  const [isSpeakingId, setIsSpeakingId] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // ── Theme-aware class strings ─────────────────────────────────────────────
  const assistantBubbleClass = isDark
    ? "bg-[#1E293B] border border-[#334155] text-[#F8FAFC]"
    : "bg-[#F8FAFC] border border-[#E5E7EB] text-[#111827]";

  const userBubbleClass = isDark
    ? "bg-neon/15 border border-neon/20 text-ink"
    : "bg-blue-50 border border-blue-200 text-[#1E3A5F]";

  // ── Speech recognition setup ──────────────────────────────────────────────
  useEffect(() => {
    const SR =
      (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition
      ?? (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
    if (!SR) return;

    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = language === "hi" ? "hi-IN" : language === "mr" ? "mr-IN" : "en-IN";

    rec.onstart  = () => setIsListening(true);
    rec.onend    = () => setIsListening(false);
    rec.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInputText((prev) => (prev ? prev + " " : "") + transcript);
    };
    rec.onerror = () => setIsListening(false);
    recognitionRef.current = rec;
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
      return;
    }
    isListening ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  // ── TTS ───────────────────────────────────────────────────────────────────
  const handleSpeak = (text: string, msgId: string) => {
    if (isSpeakingId === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeakingId(null);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`~]/g, ""));
    utterance.onend  = () => setIsSpeakingId(null);
    utterance.onerror = () => setIsSpeakingId(null);
    setIsSpeakingId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => () => { window.speechSynthesis.cancel(); }, []);

  // ── Data fetching ─────────────────────────────────────────────────────────
  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await api.get<ChatSession[]>("/chat/sessions");
      setSessions(data);
      if (data.length > 0 && !currentSessionId) {
        const param = new URLSearchParams(window.location.search).get("session");
        const found = data.some((s) => s.id === param);
        setCurrentSessionId(found ? param : data[0].id);
      }
    } catch { /* silently ignore */ }
  }, [currentSessionId]);

  const fetchDocuments = useCallback(async () => {
    try {
      const { data } = await api.get<Document[]>("/documents");
      setDocuments(data);
    } catch { /* silently ignore */ }
  }, []);

  useEffect(() => { void fetchSessions(); void fetchDocuments(); }, [fetchSessions, fetchDocuments]);

  useEffect(() => {
    if (!currentSessionId) return;
    api.get<ChatMessage[]>(`/chat/sessions/${currentSessionId}/messages`)
      .then(({ data }) => setMessages(data))
      .catch(() => {});
  }, [currentSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // ── Actions ───────────────────────────────────────────────────────────────
  const handleCreateSession = async () => {
    try {
      const { data } = await api.post<ChatSession>("/chat/sessions", { title: "New Legal Chat" });
      setSessions((prev) => [data, ...prev]);
      setCurrentSessionId(data.id);
      setMessages([]);
      setIsSidebarOpen(false);
    } catch { /* ignore */ }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !currentSessionId || isLoading) return;

    const text = inputText;
    setInputText("");
    setIsLoading(true);

    setMessages((prev) => [...prev, {
      id: Math.random().toString(),
      role: "user",
      content: text,
      citations: [],
      created_at: new Date().toISOString(),
    }]);

    try {
      const { data } = await api.post<ChatMessage>(`/chat/sessions/${currentSessionId}/ask`, {
        message: text,
        language,
      });
      setMessages((prev) => [...prev, data]);
      void fetchSessions();
    } catch { /* ignore */ } finally {
      setIsLoading(false);
    }
  };

  const activeDocCount = documents.filter((d) => d.status === "completed").length;

  // ── Layout classes ────────────────────────────────────────────────────────
  const pageClass  = isDark ? "bg-surface/20" : "bg-white/80";
  const topbarBorderClass = isDark ? "border-white/5" : "border-slate-200";
  const sidebarClass = isDark
    ? "bg-void/95 border-r border-white/5"
    : "bg-white border-r border-slate-200";

  return (
    <div className="relative flex h-[calc(100vh-4rem)] gap-0 overflow-hidden md:gap-4">

      {/* ── Mobile scrim ─────────────────────────────────────────────────── */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            key="chat-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-20 bg-black/50 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* ── Sessions sidebar ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {/* Desktop: always visible (not animated) */}
        <aside
          className={`
            hidden md:flex md:relative md:w-60 md:flex-col md:rounded-2xl md:border
            ${isDark ? "md:border-white/5 md:bg-surface/40" : "md:border-slate-200 md:bg-white"}
            p-4
          `}
        >
          <SidebarInner
            sessions={sessions}
            currentSessionId={currentSessionId}
            documents={documents}
            activeDocCount={activeDocCount}
            isDark={isDark}
            onSelectSession={(id) => setCurrentSessionId(id)}
            onCreateSession={handleCreateSession}
            onClose={() => setIsSidebarOpen(false)}
            showCloseButton={false}
          />
        </aside>

        {/* Mobile: animated drawer */}
        {isSidebarOpen && (
          <motion.aside
            key="chat-sidebar"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
            className={`absolute inset-y-0 left-0 z-30 flex w-72 flex-col p-4 md:hidden ${sidebarClass} backdrop-blur-xl`}
          >
            <SidebarInner
              sessions={sessions}
              currentSessionId={currentSessionId}
              documents={documents}
              activeDocCount={activeDocCount}
              isDark={isDark}
              onSelectSession={(id) => { setCurrentSessionId(id); setIsSidebarOpen(false); }}
              onCreateSession={handleCreateSession}
              onClose={() => setIsSidebarOpen(false)}
              showCloseButton
            />
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ── Main chat area ───────────────────────────────────────────────── */}
      <main className={`flex flex-1 flex-col overflow-hidden rounded-2xl border ${topbarBorderClass} ${pageClass}`}>

        {/* Chat topbar */}
        <div className={`flex items-center justify-between border-b ${topbarBorderClass} px-4 py-3 shrink-0`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="rounded-lg p-1.5 text-ink-muted hover:bg-white/[0.05] hover:text-ink transition-colors md:hidden"
              aria-label="Open chat list"
            >
              <MessageSquare size={18} />
            </button>
            <div>
              <p className="font-semibold text-ink text-sm">NyayaAI Assistant</p>
              <p className="text-[11px] text-ink-muted leading-tight">
                {activeDocCount > 0
                  ? `${activeDocCount} document${activeDocCount > 1 ? "s" : ""} in context`
                  : "General legal knowledge"}
              </p>
            </div>
          </div>

          {/* Language selector */}
          <div className={`flex items-center gap-1.5 rounded-lg border px-2 py-1 ${isDark ? "border-white/10 bg-white/[0.03]" : "border-slate-200 bg-slate-50"}`}>
            <Globe size={13} className="text-ink-faint shrink-0" />
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value as Lang)}
              className={`bg-transparent text-xs focus:outline-none cursor-pointer ${isDark ? "text-ink-muted" : "text-slate-600"}`}
              aria-label="Response language"
            >
              {LANG_OPTIONS.map((o) => (
                <option key={o.value} value={o.value} className={isDark ? "bg-void text-ink" : "bg-white text-slate-900"}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center p-8">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-neon/10 text-neon">
                <MessageSquare size={32} />
              </div>
              <h3 className="font-semibold text-ink text-lg">Start a Legal Dialogue</h3>
              <p className="mt-2 text-sm text-ink-muted max-w-sm">
                Ask about your uploaded documents or Indian law — in English, Hindi, or Marathi.
              </p>
              {sessions.length === 0 && (
                <button onClick={handleCreateSession} className="btn-primary mt-6">
                  <Plus size={15} /> New Chat
                </button>
              )}
            </div>
          ) : (
            <>
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    variants={msgVariants}
                    initial="hidden"
                    animate="visible"
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`relative max-w-[80%] rounded-2xl p-4 sm:max-w-[72%] shadow-sm ${
                        msg.role === "user"
                          ? `${userBubbleClass} rounded-tr-none`
                          : `${assistantBubbleClass} rounded-tl-none shadow-lg`
                      }`}
                    >
                      {/* TTS button — assistant only */}
                      {msg.role === "assistant" && (
                        <button
                          onClick={() => handleSpeak(msg.content, msg.id)}
                          className={`absolute right-3 top-3 rounded p-1 transition-colors ${
                            isDark
                              ? "text-ink-faint hover:bg-white/5 hover:text-ink"
                              : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                          }`}
                          title={isSpeakingId === msg.id ? "Stop" : "Read aloud"}
                          aria-label={isSpeakingId === msg.id ? "Stop reading" : "Read aloud"}
                        >
                          {isSpeakingId === msg.id ? <VolumeX size={13} /> : <Volume2 size={13} />}
                        </button>
                      )}

                      {/* Message content */}
                      {msg.role === "assistant" ? (
                        <MarkdownRenderer
                          content={msg.content}
                          theme={theme}
                          className="pr-6"
                        />
                      ) : (
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      )}

                      {/* Citations */}
                      {msg.role === "assistant" && msg.citations && msg.citations.length > 0 && (
                        <div className={`mt-3 border-t pt-3 ${isDark ? "border-white/5" : "border-slate-200"}`}>
                          <p className={`mb-1.5 text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-ink-faint" : "text-slate-400"}`}>
                            Sources
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.citations.map((cite, i) => (
                              <span
                                key={i}
                                title={cite.preview}
                                className="inline-flex items-center gap-1 rounded-full border border-violet/20 bg-violet/10 px-2 py-0.5 text-[10px] text-violet-soft font-mono"
                              >
                                <FileText size={9} />
                                {cite.filename} · pg {cite.page_number}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Loading shimmer */}
              {isLoading && (
                <motion.div
                  key="loading-shimmer"
                  variants={msgVariants}
                  initial="hidden"
                  animate="visible"
                  className="flex justify-start"
                >
                  <div className={`max-w-[60%] rounded-2xl rounded-tl-none border p-4 shadow-lg ${assistantBubbleClass}`}>
                    <LoadingShimmer lines={3} />
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input form */}
        <form
          onSubmit={handleSend}
          className={`shrink-0 border-t p-3 sm:p-4 ${isDark ? "border-white/5 bg-surface/30" : "border-slate-200 bg-slate-50"}`}
        >
          {/* Input container with focus glow */}
          <div className={`relative flex items-center rounded-full transition-shadow duration-200
            focus-within:ring-2 focus-within:ring-neon/40 focus-within:shadow-[0_0_0_4px_rgba(77,163,255,0.10)]`}
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={
                language === "hi" ? "कानूनी सवाल पूछें…"
                : language === "mr" ? "कायदेशीर प्रश्न विचारा…"
                : "Ask a legal question…"
              }
              disabled={isLoading || !currentSessionId}
              className={`w-full rounded-full border py-3 pl-4 pr-24 text-sm transition-colors focus:outline-none disabled:opacity-50 ${
                isDark
                  ? "border-white/10 bg-void text-ink placeholder-ink-faint focus:border-neon"
                  : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-neon/60"
              }`}
            />
            <div className="absolute right-2 flex items-center gap-1">
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading || !currentSessionId}
                className={`rounded-full p-2.5 transition-colors disabled:opacity-40 ${
                  isListening
                    ? "animate-pulse bg-red-500/20 text-red-400"
                    : isDark
                    ? "text-ink-muted hover:bg-white/[0.05] hover:text-ink"
                    : "text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                }`}
                aria-label={isListening ? "Stop voice input" : "Voice input"}
              >
                {isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
              <button
                type="submit"
                disabled={!inputText.trim() || isLoading || !currentSessionId}
                className="rounded-full bg-neon p-2.5 text-void transition-all hover:bg-neon-soft hover:shadow-[0_0_12px_rgba(77,163,255,0.5)] disabled:opacity-30"
                aria-label="Send message"
              >
                <Send size={15} />
              </button>
            </div>
          </div>

          {!currentSessionId && sessions.length === 0 && (
            <p className="mt-2 text-center text-xs text-ink-faint">
              <button onClick={handleCreateSession} className="text-neon hover:underline">
                Create a new chat
              </button>{" "}
              to get started.
            </p>
          )}
        </form>
      </main>
    </div>
  );
}

// ─── Extracted sidebar inner content ─────────────────────────────────────────
// Shared between desktop and mobile drawer to avoid duplication.

interface SidebarInnerProps {
  sessions: ChatSession[];
  currentSessionId: string | null;
  documents: Document[];
  activeDocCount: number;
  isDark: boolean;
  onSelectSession: (id: string) => void;
  onCreateSession: () => void;
  onClose: () => void;
  showCloseButton: boolean;
}

function SidebarInner({
  sessions,
  currentSessionId,
  documents,
  activeDocCount,
  isDark,
  onSelectSession,
  onCreateSession,
  onClose,
  showCloseButton,
}: SidebarInnerProps) {
  const sessionActiveClass = isDark
    ? "bg-neon/10 text-neon font-medium"
    : "bg-blue-50 text-blue-700 font-medium";

  const sessionInactiveClass = isDark
    ? "text-ink-muted hover:bg-white/[0.03] hover:text-ink"
    : "text-slate-500 hover:bg-slate-100 hover:text-slate-900";

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-ink flex items-center gap-1.5">
          <HistoryIcon size={16} className="text-neon" /> Chats
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={onCreateSession}
            className="p-1.5 rounded-lg bg-neon/10 text-neon hover:bg-neon/20 transition-colors"
            title="New Chat"
            aria-label="New chat"
          >
            <Plus size={16} />
          </button>
          {showCloseButton && (
            <button
              onClick={onClose}
              className={`p-1.5 rounded-lg transition-colors ${isDark ? "text-ink-muted hover:bg-white/[0.06]" : "text-slate-400 hover:bg-slate-100"}`}
              aria-label="Close chat list"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {sessions.length === 0 ? (
          <p className={`text-xs italic px-1 ${isDark ? "text-ink-faint" : "text-slate-400"}`}>
            No sessions yet. Start one below.
          </p>
        ) : (
          sessions.map((s) => (
            <motion.button
              key={s.id}
              onClick={() => onSelectSession(s.id)}
              whileHover={{ x: 3 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className={`w-full text-left rounded-lg px-3 py-2.5 text-sm truncate block transition-colors ${
                currentSessionId === s.id ? sessionActiveClass : sessionInactiveClass
              }`}
            >
              {s.title}
            </motion.button>
          ))
        )}
      </div>

      {/* Active documents */}
      <div className={`mt-4 pt-4 border-t shrink-0 ${isDark ? "border-white/5" : "border-slate-200"}`}>
        <h3 className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDark ? "text-ink-muted" : "text-slate-400"}`}>
          Context Docs ({activeDocCount})
        </h3>
        <div className="space-y-1.5 max-h-36 overflow-y-auto">
          {documents.length === 0 ? (
            <p className={`text-xs italic ${isDark ? "text-ink-faint" : "text-slate-400"}`}>
              Upload documents to add context.
            </p>
          ) : (
            documents.map((d) => (
              <div key={d.id} className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs ${isDark ? "bg-white/[0.02]" : "bg-slate-50"}`}>
                <FileText size={12} className={d.status === "completed" ? "text-neon" : "text-ink-faint"} />
                <span className={`truncate flex-1 ${
                  d.status === "completed"
                    ? isDark ? "text-ink" : "text-slate-700"
                    : isDark ? "text-ink-faint" : "text-slate-400"
                }`}>
                  {d.filename}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
