import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Sparkles } from "lucide-react";

interface Exchange {
  question: string;
  answer: string;
  citation: string;
}

const EXCHANGES: Exchange[] = [
  {
    question: "Can my landlord keep my full deposit for normal wear and tear?",
    answer: "No — deductions are limited to damage beyond ordinary use.",
    citation: "Model Tenancy Act, 2021 · Sec. 12(3)",
  },
  {
    question: "What's the notice period to resign without a contract clause?",
    answer: "30 days is the default notice period under the Act.",
    citation: "Industrial Employment Act · Sec. 4(1)",
  },
  {
    question: "Am I eligible for the PM housing subsidy on a joint loan?",
    answer: "Yes, if the co-applicant is a family member and income qualifies.",
    citation: "PMAY Guidelines · Cl. 5.2",
  },
];

const TYPING_SPEED_MS = 28;

export default function CitationDemo() {
  const [exchangeIndex, setExchangeIndex] = useState(0);
  const [typedQuestion, setTypedQuestion] = useState("");
  const [showAnswer, setShowAnswer] = useState(false);
  const [showCitation, setShowCitation] = useState(false);

  const current = EXCHANGES[exchangeIndex];

  useEffect(() => {
    setTypedQuestion("");
    setShowAnswer(false);
    setShowCitation(false);

    let charIndex = 0;
    const typingTimer = setInterval(() => {
      charIndex += 1;
      setTypedQuestion(current.question.slice(0, charIndex));
      if (charIndex >= current.question.length) {
        clearInterval(typingTimer);
        setTimeout(() => setShowAnswer(true), 300);
        setTimeout(() => setShowCitation(true), 1100);
        setTimeout(() => {
          setExchangeIndex((previous) => (previous + 1) % EXCHANGES.length);
        }, 4600);
      }
    }, TYPING_SPEED_MS);

    return () => clearInterval(typingTimer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exchangeIndex]);

  return (
    <div className="glass-panel w-full max-w-md p-6 shadow-2xl shadow-neon/10">
      <div className="mb-4 flex items-center gap-2 text-ink-muted">
        <Sparkles size={16} className="text-violet" aria-hidden="true" />
        <span className="font-mono text-xs tracking-wide">NyayaAI · live answer preview</span>
      </div>

      <div className="min-h-[3rem] font-body text-[15px] leading-relaxed text-ink">
        {typedQuestion}
        <span className="animate-pulse text-neon">|</span>
      </div>

      <AnimatePresence>
        {showAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-4 rounded-xl border border-neon/20 bg-neon/[0.06] p-4"
          >
            <p className="text-sm leading-relaxed text-ink">{current.answer}</p>

            <AnimatePresence>
              {showCitation && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-violet/30 bg-violet/10 px-3 py-1"
                >
                  <FileText size={12} className="text-violet-soft" aria-hidden="true" />
                  <span className="font-mono text-[11px] text-violet-soft">
                    {current.citation}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
