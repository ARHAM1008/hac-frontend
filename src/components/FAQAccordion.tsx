import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    question: "Is NyayaAI a substitute for a lawyer?",
    answer:
      "No. NyayaAI explains documents and points you to the relevant law, but for binding decisions — disputes, court filings, contracts above routine matters — talk to a licensed advocate.",
  },
  {
    question: "What happens to documents I upload?",
    answer:
      "Documents are stored securely under your account and are never used to train shared models. You can delete any document, which also removes it from search.",
  },
  {
    question: "Which languages are supported?",
    answer:
      "Chat and voice currently support English, Hindi, and Marathi, with more Indian languages planned.",
  },
  {
    question: "How does NyayaAI decide which government schemes apply to me?",
    answer:
      "You answer a short set of eligibility questions once; that profile is matched against scheme criteria to surface only what you likely qualify for.",
  },
];

const headingVariants = {
  hidden:   { opacity: 0, y: 20 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const itemVariants = {
  hidden:   { opacity: 0, x: -22 },
  visible:  (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.42, delay: i * 0.08, ease: "easeOut" },
  }),
};

export default function FAQAccordion() {
  return (
    <section id="faqs" className="mx-auto max-w-3xl px-6 py-24">
      <motion.h2
        className="text-center font-display text-3xl font-semibold text-ink md:text-4xl"
        variants={headingVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-60px" }}
      >
        Frequently asked questions
      </motion.h2>

      <div className="mt-10 space-y-3">
        {FAQS.map((faq, i) => (
          <motion.details
            key={faq.question}
            custom={i}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            className="group glass-panel overflow-hidden px-6 py-4 [&_summary::-webkit-details-marker]:hidden"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-sm font-medium text-ink marker:content-none">
              {faq.question}
              <ChevronDown
                size={18}
                className="shrink-0 text-ink-faint transition-transform duration-200 group-open:rotate-180"
                aria-hidden="true"
              />
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">{faq.answer}</p>
          </motion.details>
        ))}
      </div>
    </section>
  );
}
