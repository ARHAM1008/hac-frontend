import { useState, useEffect } from "react";
import { Search, Landmark, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";
import type { Scheme } from "@/lib/types";

const CATEGORIES = ["All", "Agriculture", "Healthcare", "Finance", "Housing", "Education", "Employment", "Welfare"];

export default function SchemesPage() {
  const [schemes, setSchemes] = useState<Scheme[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSchemes = async () => {
      try {
        const { data } = await api.get<Scheme[]>("/schemes");
        setSchemes(data);
      } catch (err) {
        console.error("Failed to load schemes", err);
      } finally {
        setIsLoading(false);
      }
    };
    void fetchSchemes();
  }, []);

  const filteredSchemes = schemes.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "All" || s.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Government Scheme Directory</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Browse legal aid, subsidies, and welfare schemes available in India.
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? "bg-neon text-void"
                  : "bg-white/[0.03] text-ink-muted hover:bg-white/[0.06] hover:text-ink"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search schemes..."
            className="w-full bg-surface border border-white/10 rounded-full py-2.5 pl-10 pr-4 text-xs text-ink placeholder-ink-faint focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
          />
          <Search size={14} className="absolute left-3.5 top-3.5 text-ink-faint" />
        </div>
      </div>

      {/* Schemes Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20 text-neon">
          <Landmark size={40} className="animate-pulse" />
        </div>
      ) : filteredSchemes.length === 0 ? (
        <div className="glass-panel p-12 text-center text-ink-muted text-sm">
          No schemes found matching the filters.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredSchemes.map((s) => (
            <div
              key={s.id}
              className="glass-panel p-6 flex flex-col justify-between border border-white/5 hover:border-white/10 transition-all hover:scale-[1.01]"
            >
              <div>
                <div className="flex items-start justify-between gap-4">
                  <span className="inline-block px-2.5 py-1 rounded bg-neon/15 border border-neon/20 text-[10px] text-neon-soft font-semibold uppercase tracking-wider">
                    {s.category}
                  </span>
                </div>
                <h3 className="mt-3 font-semibold text-ink text-base line-clamp-1">{s.name}</h3>
                <p className="mt-2 text-xs text-ink-muted leading-relaxed line-clamp-3">{s.description}</p>
              </div>

              <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase font-mono text-ink-faint">Benefits</p>
                  <p className="text-xs text-violet font-semibold line-clamp-1">{s.benefits}</p>
                </div>
                <a
                  href={s.details_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-neon hover:text-neon-soft font-semibold transition-colors"
                >
                  Apply <ArrowUpRight size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
