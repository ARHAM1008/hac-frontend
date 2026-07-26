import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MessageSquare, Trash2, Calendar, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import type { ChatSession } from "@/lib/types";

export default function HistoryPage() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSessions = async () => {
    try {
      const { data } = await api.get<ChatSession[]>("/chat/sessions");
      setSessions(data);
    } catch (err) {
      console.error("Failed to load chat history", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchSessions();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.delete(`/chat/sessions/${id}`);
      setSessions((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete session", err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Chat History</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Access your past questions and discussions with NyayaAI.
        </p>
      </div>

      {isLoading ? (
        <div className="glass-panel p-12 text-center text-ink-muted text-sm">
          Loading history...
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-panel p-12 text-center text-ink-muted text-sm">
          No chat history found. Start a new chat to begin!
        </div>
      ) : (
        <div className="grid gap-4">
          {sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => navigate(`/dashboard/chat?session=${session.id}`)}
              className="glass-panel p-5 flex items-center justify-between border border-white/5 hover:border-white/10 hover:bg-white/[0.01] transition-all cursor-pointer"
            >
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-neon/10 rounded-lg flex items-center justify-center text-neon">
                  <MessageSquare size={18} />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium text-ink text-sm line-clamp-1">{session.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-ink-muted">
                    <Calendar size={12} />
                    <span>{new Date(session.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => handleDelete(session.id, e)}
                  className="p-2 text-ink-faint hover:text-red-400 rounded-lg hover:bg-white/[0.04] transition-colors"
                  title="Delete chat session"
                >
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={18} className="text-ink-faint" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
