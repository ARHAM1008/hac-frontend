import { useEffect, useState, type ElementType } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FileText,
  MessagesSquare,
  Landmark,
  UploadCloud,
  Plus,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Document, ChatSession } from "@/lib/types";
import AnimatedCounter from "@/components/ui/AnimatedCounter";

// ─── tiny helpers ────────────────────────────────────────────────────────────

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── animation variants ───────────────────────────────────────────────────────

const cardContainerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
};

const cardItemVariants = {
  hidden: { opacity: 0, y: 22 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

// ─── stat card ───────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: number;
  icon: ElementType;
  color: string;
  loading?: boolean;
}

function StatCard({ label, value, icon: Icon, color, loading }: StatCardProps) {
  return (
    <div className="glass-panel flex items-center gap-4 p-5 backdrop-blur-xl transition-shadow hover:shadow-[0_0_32px_rgba(77,163,255,0.08)]">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color}`}>
        <Icon size={22} className="text-white" aria-hidden="true" />
      </div>
      <div>
        {loading ? (
          <div className="h-6 w-12 animate-pulse rounded bg-white/10" />
        ) : (
          <p className="text-2xl font-bold text-ink">
            <AnimatedCounter target={value} />
          </p>
        )}
        <p className="text-xs text-ink-muted mt-0.5">{label}</p>
      </div>
    </div>
  );
}

// ─── empty placeholder ───────────────────────────────────────────────────────

function EmptyCard({
  icon: Icon,
  title,
  description,
  actionLabel,
  to,
}: {
  icon: ElementType;
  title: string;
  description: string;
  actionLabel: string;
  to: string;
}) {
  return (
    <div className="glass-panel flex flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">
        <Icon size={22} className="text-ink-faint" aria-hidden="true" />
      </div>
      <div>
        <p className="font-semibold text-ink text-sm">{title}</p>
        <p className="mt-1 text-xs text-ink-muted leading-relaxed">{description}</p>
      </div>
      <Link
        to={to}
        className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-neon/10 px-4 py-2 text-xs font-medium text-neon transition-colors hover:bg-neon/20"
      >
        {actionLabel} <ArrowRight size={12} />
      </Link>
    </div>
  );
}

// ─── main ────────────────────────────────────────────────────────────────────

export default function DashboardHome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  const [docs, setDocs] = useState<Document[]>([]);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [docsRes, sessionsRes] = await Promise.all([
          api.get<Document[]>("/documents"),
          api.get<ChatSession[]>("/chat/sessions"),
        ]);
        setDocs(docsRes.data);
        setSessions(sessionsRes.data);
      } catch {
        // silently fail — user sees empty state
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const readyDocs = docs.filter((d) => d.status === "completed");
  const recentDocs = docs.slice(0, 5);
  const recentSessions = sessions.slice(0, 5);

  return (
    <div className="relative space-y-8 pb-8">
      {/* ── Ambient gradient blobs ─────────────────────────────────────────── */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-24 -left-12 h-96 w-96 rounded-full bg-neon/[0.07] blur-[130px] animate-pulse-glow" />
        <div className="absolute top-48 right-[-60px] h-80 w-80 rounded-full bg-violet/[0.07] blur-[110px] animate-pulse-glow [animation-delay:2.5s]" />
      </div>

      {/* ── Welcome header ────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Welcome back, {firstName} 👋
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            Your documents, chats, and matched schemes — all in one place.
          </p>
        </div>
        <button
          onClick={() => navigate("/dashboard/upload")}
          className="btn-primary mt-3 sm:mt-0 self-start sm:self-auto"
        >
          <UploadCloud size={16} /> Upload Document
        </button>
      </motion.div>

      {/* ── Stat cards — staggered slide-up ───────────────────────────────── */}
      <motion.div
        className="grid grid-cols-2 gap-4 sm:grid-cols-3"
        variants={cardContainerVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={cardItemVariants}>
          <StatCard
            label="Documents uploaded"
            value={docs.length}
            icon={FileText}
            color="bg-violet/70"
            loading={loading}
          />
        </motion.div>
        <motion.div variants={cardItemVariants}>
          <StatCard
            label="Ready for AI"
            value={readyDocs.length}
            icon={CheckCircle2}
            color="bg-emerald-500/70"
            loading={loading}
          />
        </motion.div>
        <motion.div variants={cardItemVariants}>
          <StatCard
            label="Chat sessions"
            value={sessions.length}
            icon={MessagesSquare}
            color="bg-neon/60"
            loading={loading}
          />
        </motion.div>
      </motion.div>

      {/* ── Main two-column grid ──────────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── Recent Documents ─────────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent Documents</h2>
            <Link
              to="/dashboard/upload"
              className="text-xs text-neon hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="glass-panel space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-lg bg-white/10" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-2/3 rounded bg-white/10" />
                    <div className="h-2.5 w-1/3 rounded bg-white/[0.06]" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentDocs.length === 0 ? (
            <EmptyCard
              icon={FileText}
              title="No documents yet"
              description="Upload a PDF or TXT file to start asking AI-powered questions about its contents."
              actionLabel="Upload a document"
              to="/dashboard/upload"
            />
          ) : (
            <div className="glass-panel divide-y divide-white/5 overflow-hidden">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05]">
                    <FileText size={16} className="text-ink-muted" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink" title={doc.filename}>
                      {doc.filename}
                    </p>
                    <p className="text-xs text-ink-faint">
                      {formatBytes(doc.file_size)} · {timeAgo(doc.created_at)}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      doc.status === "completed"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : doc.status === "processing"
                        ? "bg-amber/15 text-amber"
                        : "bg-red-500/15 text-red-400"
                    }`}
                  >
                    {doc.status === "completed" && <CheckCircle2 size={10} />}
                    {doc.status === "processing" && <Loader2 size={10} className="animate-spin" />}
                    {doc.status === "failed" && <AlertCircle size={10} />}
                    {doc.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* ── Recent Chat Sessions ──────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">Recent Chats</h2>
            <button
              onClick={() => navigate("/dashboard/chat")}
              className="text-xs text-neon hover:underline flex items-center gap-1"
            >
              Open chat <ArrowRight size={11} />
            </button>
          </div>

          {loading ? (
            <div className="glass-panel space-y-3 p-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="h-9 w-9 rounded-lg bg-white/10" />
                  <div className="flex-1 space-y-1.5">
                    <div className="h-3 w-3/4 rounded bg-white/10" />
                    <div className="h-2.5 w-1/4 rounded bg-white/[0.06]" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentSessions.length === 0 ? (
            <EmptyCard
              icon={MessagesSquare}
              title="No chats yet"
              description="Upload a document then start a session to ask questions in English, Hindi, or Marathi."
              actionLabel="Start a chat"
              to="/dashboard/chat"
            />
          ) : (
            <div className="glass-panel divide-y divide-white/5 overflow-hidden">
              {recentSessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => navigate(`/dashboard/chat?session=${s.id}`)}
                  className="flex w-full items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-neon/10">
                    <MessagesSquare size={16} className="text-neon" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{s.title}</p>
                    <p className="text-xs text-ink-faint flex items-center gap-1">
                      <Clock size={10} /> {timeAgo(s.created_at)}
                    </p>
                  </div>
                  <ArrowRight size={14} className="shrink-0 text-ink-faint" />
                </button>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* ── Quick-access bottom row ───────────────────────────────────────── */}
      <motion.div
        className="grid gap-4 sm:grid-cols-3"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Link
          to="/dashboard/schemes"
          className="glass-panel flex items-center gap-3 p-4 hover:bg-white/[0.06] transition-colors group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber/15">
            <Landmark size={18} className="text-amber" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Scheme Finder</p>
            <p className="text-xs text-ink-muted truncate">Discover government schemes</p>
          </div>
          <ArrowRight size={16} className="ml-auto shrink-0 text-ink-faint group-hover:text-ink transition-colors" />
        </Link>

        <button
          onClick={() => navigate("/dashboard/chat")}
          className="glass-panel flex items-center gap-3 p-4 hover:bg-white/[0.06] transition-colors group text-left"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-neon/15">
            <Plus size={18} className="text-neon" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">New Chat</p>
            <p className="text-xs text-ink-muted truncate">Ask in English, Hindi or Marathi</p>
          </div>
          <ArrowRight size={16} className="ml-auto shrink-0 text-ink-faint group-hover:text-ink transition-colors" />
        </button>

        <Link
          to="/dashboard/eligibility"
          className="glass-panel flex items-center gap-3 p-4 hover:bg-white/[0.06] transition-colors group"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet/15">
            <CheckCircle2 size={18} className="text-violet-soft" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ink">Eligibility Check</p>
            <p className="text-xs text-ink-muted truncate">See schemes you qualify for</p>
          </div>
          <ArrowRight size={16} className="ml-auto shrink-0 text-ink-faint group-hover:text-ink transition-colors" />
        </Link>
      </motion.div>
    </div>
  );
}
