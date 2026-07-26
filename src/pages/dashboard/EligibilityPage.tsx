import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, ArrowLeft, ArrowUpRight, AlertCircle } from "lucide-react";
import { api } from "@/lib/api";
import type { SchemeMatch } from "@/lib/types";

const INDIA_STATES = [
  "Andhra Pradesh","Arunachal Pradesh","Assam","Bihar","Chhattisgarh","Goa","Gujarat",
  "Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh",
  "Maharashtra","Manipur","Meghalaya","Mizoram","Nagaland","Odisha","Punjab","Rajasthan",
  "Sikkim","Tamil Nadu","Telangana","Tripura","Uttar Pradesh","Uttarakhand","West Bengal",
  "Andaman and Nicobar Islands","Chandigarh","Delhi","Jammu and Kashmir","Ladakh",
  "Lakshadweep","Puducherry",
];

export default function EligibilityPage() {
  const [age,        setAge]        = useState<number | "">("");
  const [income,     setIncome]     = useState<number | "">("");
  const [occupation, setOccupation] = useState("Salaried");
  const [gender,     setGender]     = useState("Male");
  const [state,      setState]      = useState("Delhi");
  const [category,   setCategory]   = useState("General");

  const [results,    setResults]   = useState<SchemeMatch[] | null>(null);
  const [isLoading,  setIsLoading] = useState(false);
  const [error,      setError]     = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (age === "" || income === "") return;

    setIsLoading(true);
    setError(null);
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
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not reach the server. Make sure the backend is running.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => { setResults(null); setExpandedId(null); setError(null); };

  // ── Label class reuse ───────────────────────────────────────────────────────
  const labelClass = "block text-xs font-semibold text-ink uppercase tracking-wider mb-2";
  const inputClass =
    "w-full bg-white/[0.03] border border-white/10 rounded-lg p-3 text-sm text-ink " +
    "placeholder-ink-faint focus:border-neon focus:outline-none transition-colors";

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="font-display text-2xl font-semibold text-ink">Scheme Eligibility Checker</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Enter your details and we'll match you against every central government scheme in our database.
        </p>
      </motion.div>

      {/* ── Error banner ─────────────────────────────────────────────────────── */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* ── Form ─────────────────────────────────────────────────────────────── */}
      {!results ? (
        <form onSubmit={handleSubmit} className="dashboard-glass p-8 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Age */}
            <div>
              <label htmlFor="age" className={labelClass}>Age (years)</label>
              <input
                id="age" type="number" required min={0} max={120}
                value={age}
                onChange={(e) => setAge(e.target.value !== "" ? Number(e.target.value) : "")}
                placeholder="e.g. 28"
                className={inputClass}
              />
            </div>

            {/* Income */}
            <div>
              <label htmlFor="income" className={labelClass}>Annual Household Income (₹)</label>
              <input
                id="income" type="number" required min={0}
                value={income}
                onChange={(e) => setIncome(e.target.value !== "" ? Number(e.target.value) : "")}
                placeholder="e.g. 150000"
                className={inputClass}
              />
            </div>

            {/* Occupation */}
            <div>
              <label htmlFor="occupation" className={labelClass}>Occupation</label>
              <select id="occupation" value={occupation} onChange={(e) => setOccupation(e.target.value)} className={inputClass}>
                <option value="Farmer">Farmer</option>
                <option value="Salaried">Salaried Employee</option>
                <option value="Self-Employed">Self-Employed / Business</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Student">Student</option>
              </select>
            </div>

            {/* Gender */}
            <div>
              <label htmlFor="gender" className={labelClass}>Gender</label>
              <select id="gender" value={gender} onChange={(e) => setGender(e.target.value)} className={inputClass}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other / Transgender</option>
              </select>
            </div>

            {/* State */}
            <div>
              <label htmlFor="state" className={labelClass}>State of Residence</label>
              <select id="state" value={state} onChange={(e) => setState(e.target.value)} className={inputClass}>
                {INDIA_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className={labelClass}>Social Category</label>
              <select id="category" value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                <option value="General">General</option>
                <option value="OBC">OBC (Other Backward Classes)</option>
                <option value="SC">SC (Scheduled Caste)</option>
                <option value="ST">ST (Scheduled Tribe)</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button type="submit" disabled={isLoading} className="btn-primary w-full md:w-auto disabled:opacity-60">
              {isLoading ? "Running matching algorithms…" : "Find Eligible Schemes"}
            </button>
          </div>
        </form>
      ) : (
        /* ── Results ────────────────────────────────────────────────────────── */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="space-y-6"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="p-2 rounded-lg bg-white/[0.04] text-ink-muted hover:text-ink
                hover:bg-white/[0.08] transition-colors"
              aria-label="Go back to form"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <h2 className="text-lg font-semibold text-ink">
                {results.filter((r) => r.is_eligible).length} eligible scheme
                {results.filter((r) => r.is_eligible).length !== 1 ? "s" : ""} found
              </h2>
              <p className="text-xs text-ink-muted">
                Age {age} · Income ₹{Number(income).toLocaleString("en-IN")} · {occupation} · {state}
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {results.map((match, i) => {
              const isExpanded = expandedId === match.id;
              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.04 }}
                  className={`dashboard-glass overflow-hidden transition-colors ${
                    match.is_eligible
                      ? "border-emerald-500/15 hover:border-emerald-500/30"
                      : "hover:border-white/10"
                  }`}
                >
                  {/* Card header — click to expand */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(isExpanded ? null : match.id)}
                    className="w-full p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left"
                  >
                    <div className="flex-1 space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-semibold text-neon uppercase tracking-wider
                          px-2 py-0.5 rounded bg-neon/10">
                          {match.category}
                        </span>
                        {match.is_eligible ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold
                            text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10">
                            <CheckCircle2 size={10} /> Eligible
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-ink-faint px-2 py-0.5 rounded bg-white/5">
                            Marginal Fit
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-ink text-sm">{match.name}</p>
                      <p className="text-xs text-ink-muted line-clamp-1">{match.description}</p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-[10px] uppercase font-mono text-ink-faint">Match</p>
                      <p className={`text-xl font-bold font-display ${
                        match.score >= 80 ? "text-emerald-400"
                        : match.score >= 50 ? "text-amber"
                        : "text-ink-muted"
                      }`}>
                        {match.score}%
                      </p>
                    </div>
                  </button>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="px-5 pb-6 pt-4 border-t border-white/5 space-y-5">
                      <div className="grid gap-5 sm:grid-cols-2">
                        <div>
                          <h4 className="text-[10px] uppercase font-mono text-ink-faint mb-2">Benefits</h4>
                          <p className="text-sm text-violet-soft font-medium">{match.benefits}</p>
                        </div>
                        <div>
                          <h4 className="text-[10px] uppercase font-mono text-ink-faint mb-2">Eligibility breakdown</h4>
                          <ul className="space-y-1.5">
                            {match.reasons.map((reason, idx) => {
                              const isFail = reason.includes("exceeds") || reason.includes("outside") || reason.includes("not in");
                              return (
                                <li key={idx} className="flex items-start gap-1.5 text-xs text-ink-muted">
                                  {isFail
                                    ? <XCircle size={13} className="text-red-400 shrink-0 mt-0.5" />
                                    : <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />}
                                  {reason}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      </div>

                      <div className="flex justify-end pt-2 border-t border-white/5">
                        <a
                          href={match.details_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-neon
                            text-void hover:bg-neon-soft text-xs font-semibold transition-colors"
                        >
                          Official Portal <ArrowUpRight size={13} />
                        </a>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
