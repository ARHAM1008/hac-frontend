import { useState, useEffect } from "react";
import { Moon, Sun, Zap, Shield, CheckCircle2 } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

export default function SettingsPage() {
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [privacyMode, setPrivacyMode] = useState(false);
  const [saved, setSaved] = useState(false);

  // Persist notification & privacy prefs locally
  useEffect(() => {
    const n = localStorage.getItem("nyaya_notifications");
    const p = localStorage.getItem("nyaya_privacy");
    if (n !== null) setNotifications(n === "true");
    if (p !== null) setPrivacyMode(p === "true");
  }, []);

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem("nyaya_notifications", String(notifications));
    localStorage.setItem("nyaya_privacy", String(privacyMode));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Settings &amp; Preferences</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Adjust theme, notifications, and privacy options.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">

          {/* ── Theme ──────────────────────────────────────────────────── */}
          <div className="glass-panel p-6 border border-white/5 space-y-4">
            <h2 className="text-base font-semibold text-ink flex items-center gap-2">
              {theme === "dark"
                ? <Moon size={18} className="text-neon" />
                : <Sun size={18} className="text-amber" />}
              Appearance
            </h2>
            <p className="text-xs text-ink-muted">
              Switch between the dark void interface and a clean light mode.
            </p>
            <button
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-lg bg-neon/10 px-4 py-2.5 text-xs font-semibold text-neon transition-colors hover:bg-neon/20"
            >
              Switch to {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </button>
          </div>

          {/* ── Notifications & Privacy ─────────────────────────────── */}
          <form onSubmit={handleSavePrefs} className="glass-panel p-6 border border-white/5 space-y-6">
            <h2 className="text-base font-semibold text-ink flex items-center gap-2">
              <Shield size={18} className="text-emerald-400" /> Notifications &amp; Privacy
            </h2>

            <div className="space-y-5">
              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-ink">In-App Notifications</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Receive alerts when document processing completes.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications}
                  onChange={() => setNotifications((v) => !v)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-white/10 bg-void accent-neon"
                />
              </label>

              <label className="flex items-start justify-between gap-4 cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-ink">Strict Privacy Shield</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    Prevent document content from being used in AI training logs.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={privacyMode}
                  onChange={() => setPrivacyMode((v) => !v)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-white/10 bg-void accent-neon"
                />
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              {saved && (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400">
                  <CheckCircle2 size={14} /> Preferences saved
                </span>
              )}
              {!saved && <span />}
              <button type="submit" className="btn-primary py-2 px-5 text-xs">
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* ── System Status panel ─────────────────────────────────── */}
        <div className="md:col-span-1 space-y-4">
          <div className="glass-panel p-6 border border-white/5 space-y-4">
            <h3 className="text-sm font-semibold text-ink flex items-center gap-2">
              <Zap size={15} className="text-neon" /> System Status
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">API Server</span>
                <span className="font-semibold text-emerald-400">Online</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Document Parser</span>
                <span className="font-semibold text-emerald-400">pypdf ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Database</span>
                <span className="font-semibold text-emerald-400">PostgreSQL ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">AI Engine</span>
                <span className="font-semibold text-neon">Groq ✓</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Chat Model</span>
                <span className="font-semibold text-neon">Llama 3.3 70B</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">Languages</span>
                <span className="font-semibold text-violet-soft">EN / HI / MR</span>
              </div>
            </div>
          </div>

          <div className="glass-panel p-5 border border-white/5 space-y-2">
            <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">
              About NyayaAI
            </h3>
            <p className="text-xs text-ink-muted leading-relaxed">
              Powered by Groq's ultra-fast Llama 3.3 70B model for legal reasoning,
              with RAG retrieval over your uploaded documents.
            </p>
            <a
              href="https://console.groq.com/docs/models"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-xs text-neon hover:underline mt-1"
            >
              View available models →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
