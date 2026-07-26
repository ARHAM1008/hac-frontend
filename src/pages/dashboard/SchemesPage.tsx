import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, Landmark, ArrowUpRight, AlertCircle, RefreshCw } from "lucide-react";
import { api } from "@/lib/api";
import type { Scheme } from "@/lib/types";

const CATEGORIES = ["All", "Agriculture", "Healthcare", "Finance", "Housing", "Education", "Employment", "Welfare"];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, delay: i * 0.05, ease: "easeOut" },
  }),
};

export default function SchemesPage() {
  const [schemes, setSchemes]             = useState<Scheme[]>([]);
  const [searchQuery, setSearchQuery]     = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  const fetchSchemes = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data } = await api.get<Scheme[]>("/schemes");
      setSchemes(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to load schemes. Check your connection.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { void fetchSchemes(); }, []);

  const filteredSchemes = schemes.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q);
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="font-display text-2xl font-semibold text-ink">Government Scheme Directory</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Browse legal aid, subsidies, and welfare schemes available in India.
        </p>
      </motion.div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-neon text-void"
                  : "bg-white/[0.04] text-ink-muted hover:bg-white/[0.08] hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes…"
            className="w-full bg-white/[0.03] border border-white/10 rounded-full py-2.5 pl-10 pr-4
              text-xs text-ink placeholder-ink-faint focus:border-neon focus:outline-none
              transition-colors"
          />
          <Search size={14} className="absolute left-3.5 top-3 text-ink-faint" aria-hidden />
        </div>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center items-center py-24">
          <Landmark size={36} className="text-neon animate-pulse" />
        </div>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div className="glass-panel p-8 flex flex-col items-center gap-4 text-center">
          <AlertCircle size={32} className="text-red-400" />
          <div>
            <p className="font-semibold text-ink">Could not load schemes</p>
            <p className="mt-1 text-xs text-ink-muted">{error}</p>
          </div>
          <button
            onClick={() => void fetchSchemes()}
            className="inline-flex items-center gap-2 rounded-full bg-neon/10 px-4 py-2
              text-xs font-medium text-neon hover:bg-neon/20 transition-colors"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && filteredSchemes.length === 0 && (
        <div className="glass-panel p-12 text-center text-ink-muted text-sm">
          {schemes.length === 0
            ? "No schemes found. The server may be starting up — try refreshing."
            : "No schemes match your search or filter."}
        </div>
      )}

      {/* Grid */}
      {!isLoading && !error && filteredSchemes.length > 0 && (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchemes.map((s, i) => (
            <motion.div
              key={s.id}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
              className="dashboard-glass flex flex-col justify-between p-6
                hover:shadow-[0_0_32px_rgba(77,163,255,0.10)] transition-shadow"
            >
              <div>
                <span className="inline-block px-2.5 py-1 rounded bg-neon/15 border border-neon/20
                  text-[10px] text-neon-soft font-semibold uppercase tracking-wider">
                  {s.category}
                </span>
                <h3 className="mt-3 font-semibold text-ink text-base leading-snug line-clamp-2">
                  {s.name}
                </h3>
                <p className="mt-2 text-xs text-ink-muted leading-relaxed line-clamp-3">
                  {s.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase font-mono text-ink-faint">Benefits</p>
                  <p className="text-xs text-violet-soft font-medium line-clamp-1">{s.benefits}</p>
                </div>
                <a
                  href={s.details_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 inline-flex items-center gap-1 text-xs text-neon
                    hover:text-neon-soft font-semibold transition-colors"
                >
                  Apply <ArrowUpRight size={13} />
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
