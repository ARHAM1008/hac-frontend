import { useState } from "react";
import { CheckCircle2, XCircle, ArrowLeft, ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";
import type { SchemeMatch } from "@/lib/types";

export default function EligibilityPage() {
  const [age, setAge] = useState<number | "">("");
  const [income, setIncome] = useState<number | "">("");
  const [occupation, setOccupation] = useState("Salaried");
  const [gender, setGender] = useState("Male");
  const [state, setState] = useState("Delhi");
  const [category, setCategory] = useState("General");

  const [results, setResults] = useState<SchemeMatch[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (age === "" || income === "") return;

    setIsLoading(true);
    try {
      const { data } = await api.post<SchemeMatch[]>("/schemes/check-eligibility", {
        age: Number(age),
        income: Number(income),
        occupation,
        gender,
        state,
        category,
      });
      setResults(data);
    } catch (err) {
      console.error("Failed to check eligibility", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setResults(null);
    setExpandedId(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Scheme Eligibility Checker</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Input your details below. Our AI rules engine will analyze national welfare schemes to find matches.
        </p>
      </div>

      {!results ? (
        <form onSubmit={handleSubmit} className="glass-panel p-8 border border-white/5 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Age */}
            <div>
              <label htmlFor="age" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Age (years)
              </label>
              <input
                id="age"
                type="number"
                required
                min={0}
                max={120}
                value={age}
                onChange={(e) => setAge(e.target.value !== "" ? Number(e.target.value) : "")}
                placeholder="e.g. 28"
                className="w-full bg-void border border-white/10 rounded-lg p-3 text-sm text-ink placeholder-ink-faint focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
              />
            </div>

            {/* Income */}
            <div>
              <label htmlFor="income" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Annual Household Income (₹)
              </label>
              <input
                id="income"
                type="number"
                required
                min={0}
                value={income}
                onChange={(e) => setIncome(e.target.value !== "" ? Number(e.target.value) : "")}
                placeholder="e.g. 150000"
                className="w-full bg-void border border-white/10 rounded-lg p-3 text-sm text-ink placeholder-ink-faint focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
              />
            </div>

            {/* Occupation */}
            <div>
              <label htmlFor="occupation" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Occupation
              </label>
              <select
                id="occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full bg-void border border-white/10 rounded-lg p-3 text-sm text-ink focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
              >
                <option value="Farmer">Farmer</option>
                <option value="Salaried">Salaried Employee</option>
                <option value="Self-Employed">Self-Employed / Business</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Student">Student</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full bg-void border border-white/10 rounded-lg p-3 text-sm text-ink focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Transgender</option>
              </select>
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                State of Residence
              </label>
              <input
                id="state"
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                placeholder="e.g. Uttar Pradesh"
                className="w-full bg-void border border-white/10 rounded-lg p-3 text-sm text-ink placeholder-ink-faint focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-xs font-semibold text-ink uppercase tracking-wider mb-2">
                Caste / Social Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-void border border-white/10 rounded-lg p-3 text-sm text-ink focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
              >
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isLoading} className="btn-primary w-full md:w-auto">
              {isLoading ? "Running matching algorithms..." : "Find Eligible Schemes"}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-white/[0.03] text-ink-muted hover:text-ink hover:bg-white/[0.06] transition-colors"
              title="Go back"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-ink">Search Results</h2>
              <p className="text-xs text-ink-muted">
                Showing schemes matching details: Age {age}, Income ₹{income}, {occupation}.
              </p>
            </div>
          </div>

          {/* Results Grid */}
          <div className="space-y-4">
            {results.map((match) => {
              const isExpanded = expandedId === match.id;
              return (
                <div
                  key={match.id}
                  className={`glass-panel border transition-colors overflow-hidden ${
                    match.is_eligible
                      ? "border-emerald-500/10 hover:border-emerald-500/25"
                      : "border-white/5 hover:border-white/10"
                  }`}
                >
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : match.id)}
                    className="p-6 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-semibold text-neon uppercase tracking-wider px-2 py-0.5 rounded bg-neon/10">
                          {match.category}
                        </span>
                        {match.is_eligible ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400 uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10">
                            <CheckCircle2 size={10} /> Eligible
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-faint uppercase tracking-wider px-2 py-0.5 rounded bg-white/5">
                            Marginal Fit
                          </span>
                        )}
                      </div>
                      <h3 className="font-semibold text-ink text-base">{match.name}</h3>
                      <p className="text-xs text-ink-muted line-clamp-1">{match.description}</p>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-[10px] uppercase font-mono text-ink-faint">Compatibility</p>
                        <p
                          className={`text-lg font-bold font-display ${
                            match.score >= 80
                              ? "text-emerald-400"
                              : match.score >= 50
                              ? "text-amber"
                              : "text-ink-muted"
                          }`}
                        >
                          {match.score}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-6 pb-6 pt-4 border-t border-white/5 bg-white/[0.01] space-y-4">
                      <div>
                        <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Scheme Details</h4>
                        <p className="text-xs text-ink-muted leading-relaxed">{match.description}</p>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Benefits</h4>
                          <p className="text-xs text-violet font-medium">{match.benefits}</p>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-ink uppercase tracking-wider mb-2">Matched Parameters</h4>
                          <ul className="space-y-1.5">
                            {match.reasons.map((reason, index) => {
                              const isFailure = reason.includes("exceeds") || reason.includes("outside") || reason.includes("typically not");
                              return (
                                <li key={index} className="flex items-start gap-1.5 text-xs text-ink-muted">
                                  {isFailure ? (
                                    <XCircle size={14} className="text-red-400 shrink-0 mt-0.5" />
                                  ) : (
                                    <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                                  )}
                                  <span>{reason}</span>
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-end">
                        <a
                          href={match.details_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neon text-void hover:bg-neon-soft text-xs font-semibold transition-colors"
                        >
                          Go to Official Portal <ArrowUpRight size={14} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
