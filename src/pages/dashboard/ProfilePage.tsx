import React, { useState, useEffect } from "react";
import { User as UserIcon, FileText, MessageSquare, Landmark, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import type { Document, ChatSession } from "@/lib/types";

export default function ProfilePage() {
  const { user, refreshCurrentUser } = useAuth();
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [documentsCount, setDocumentsCount] = useState(0);
  const [chatsCount, setChatsCount] = useState(0);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [docsRes, chatsRes] = await Promise.all([
          api.get<Document[]>("/documents"),
          api.get<ChatSession[]>("/chat/sessions"),
        ]);
        setDocumentsCount(docsRes.data.length);
        setChatsCount(chatsRes.data.length);
      } catch (err) {
        console.error("Failed to fetch stats", err);
      }
    };
    void fetchStats();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || isUpdating) return;

    setIsUpdating(true);
    setMessage(null);
    try {
      await api.patch("/users/me", { full_name: fullName });
      await refreshCurrentUser();
      setMessage({ type: "success", text: "Profile updated successfully!" });
    } catch (err: any) {
      setMessage({
        type: "error",
        text: err.response?.data?.detail || "Failed to update profile.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">User Profile</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Manage your account profile, preferences, and view your activity summary.
        </p>
      </div>

      {/* Stats Section */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
        <div className="glass-panel p-6 border border-white/5 flex items-center gap-4">
          <div className="h-12 w-12 bg-neon/10 rounded-full flex items-center justify-center text-neon">
            <FileText size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono text-ink-faint">Uploaded Documents</p>
            <p className="text-xl font-bold font-display text-ink mt-0.5">{documentsCount}</p>
          </div>
        </div>

        <div className="glass-panel p-6 border border-white/5 flex items-center gap-4">
          <div className="h-12 w-12 bg-violet/10 rounded-full flex items-center justify-center text-violet-soft">
            <MessageSquare size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono text-ink-faint">AI Chats Started</p>
            <p className="text-xl font-bold font-display text-ink mt-0.5">{chatsCount}</p>
          </div>
        </div>

        <div className="glass-panel p-6 border border-white/5 flex items-center gap-4">
          <div className="h-12 w-12 bg-amber/10 rounded-full flex items-center justify-center text-amber-soft">
            <Landmark size={20} />
          </div>
          <div>
            <p className="text-[10px] uppercase font-mono text-ink-faint">Matched Schemes</p>
            <p className="text-xl font-bold font-display text-ink mt-0.5">5 Available</p>
          </div>
        </div>
      </div>

      {/* Details Form */}
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2">
          <form onSubmit={handleUpdateProfile} className="glass-panel p-8 border border-white/5 space-y-6">
            <h2 className="text-base font-semibold text-ink">Account Details</h2>

            {message && (
              <div
                className={`flex items-start gap-2.5 rounded-lg p-3.5 text-sm ${
                  message.type === "success" ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
                }`}
              >
                {message.type === "success" ? (
                  <CheckCircle size={18} className="shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle size={18} className="shrink-0 mt-0.5" />
                )}
                <span>{message.text}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                  Email Address (Unchangeable)
                </label>
                <input
                  type="email"
                  disabled
                  value={user?.email ?? ""}
                  className="w-full bg-white/[0.02] border border-white/5 rounded-lg p-3 text-sm text-ink-muted cursor-not-allowed"
                />
              </div>

              <div>
                <label htmlFor="fullName" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  id="fullName"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-void border border-white/10 rounded-lg p-3 text-sm text-ink focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button type="submit" disabled={isUpdating || !fullName.trim()} className="btn-primary w-full md:w-auto">
                {isUpdating ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Saving Changes...
                  </>
                ) : (
                  "Save Profile Changes"
                )}
              </button>
            </div>
          </form>
        </div>

        <div className="md:col-span-1">
          <div className="glass-panel p-6 border border-white/5 text-center space-y-4">
            <div className="h-20 w-20 bg-neon/15 rounded-full flex items-center justify-center text-neon mx-auto">
              <UserIcon size={40} />
            </div>
            <div>
              <h3 className="font-semibold text-ink text-base">{user?.full_name}</h3>
              <p className="text-xs text-ink-muted mt-0.5">{user?.email}</p>
            </div>
            <div className="text-[10px] text-ink-faint border-t border-white/5 pt-4">
              Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : "recently"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
