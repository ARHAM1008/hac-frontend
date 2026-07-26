import { motion } from "framer-motion";

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
}

function scorePassword(password: string): StrengthResult {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password) && /[^A-Za-z0-9]/.test(password)) score += 1;

  const levels: StrengthResult[] = [
    { score: 0, label: "Too weak", color: "bg-red-500" },
    { score: 1, label: "Weak", color: "bg-red-500" },
    { score: 2, label: "Fair", color: "bg-amber" },
    { score: 3, label: "Good", color: "bg-neon" },
    { score: 4, label: "Strong", color: "bg-emerald-400" },
  ];

  return levels[score];
}

export default function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;

  const { score, label, color } = scorePassword(password);
  const segments = [0, 1, 2, 3];

  return (
    <div className="mt-2">
      <div className="flex gap-1.5" role="status" aria-label={`Password strength: ${label}`}>
        {segments.map((segment) => (
          <div key={segment} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: segment < score ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className={`h-full origin-left ${color}`}
            />
          </div>
        ))}
      </div>
      <p className="mt-1.5 text-xs text-ink-faint">{label}</p>
    </div>
  );
}
