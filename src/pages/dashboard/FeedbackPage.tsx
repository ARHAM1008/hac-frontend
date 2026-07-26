import React, { useState } from "react";
import { Star, Loader2, Heart } from "lucide-react";
import { api } from "@/lib/api";

export default function FeedbackPage() {
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await api.post("/feedback", {
        rating,
        comment: comment.trim() || undefined,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto py-12 text-center space-y-6">
        <div className="h-16 w-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
          <Heart size={32} className="fill-current" />
        </div>
        <div className="space-y-2">
          <h1 className="font-display text-2xl font-bold text-ink">Thank you for your feedback!</h1>
          <p className="text-sm text-ink-muted leading-relaxed">
            Your review helps us refine NyayaAI to be a better legal assistant.
          </p>
        </div>
        <div>
          <button
            onClick={() => {
              setSubmitted(false);
              setComment("");
              setRating(5);
            }}
            className="btn-primary"
          >
            Submit Another Response
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-8">
      <div>
        <h1 className="font-display text-2xl font-semibold text-ink">Submit Feedback</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Your feedback shapes the future of legal clarity in India. Rate your experience.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-8 border border-white/5 space-y-6">
        {/* Rating Stars */}
        <div className="text-center space-y-3">
          <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
            Rate your experience
          </label>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = (hoveredRating ?? rating) >= star;
              return (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(null)}
                  className={`p-1.5 rounded-lg hover:bg-white/[0.04] transition-all ${
                    isActive ? "text-amber scale-110" : "text-ink-faint"
                  }`}
                >
                  <Star size={28} className={isActive ? "fill-current" : ""} />
                </button>
              );
            })}
          </div>
          <p className="text-xs text-ink-muted">
            {rating === 5 && "Excellent, perfect legal precision!"}
            {rating === 4 && "Great, very helpful tool."}
            {rating === 3 && "Good, but room for improvement."}
            {rating === 2 && "Fair, encountered some glitches."}
            {rating === 1 && "Poor, did not meet expectations."}
          </p>
        </div>

        {/* Comment Box */}
        <div className="space-y-2">
          <label htmlFor="comment" className="block text-xs font-semibold text-ink uppercase tracking-wider">
            Review Comments (Optional)
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Tell us what you liked, what went wrong, or suggestions for additional policies we should support..."
            className="w-full bg-void border border-white/10 rounded-lg p-3 text-sm text-ink placeholder-ink-faint focus:border-neon focus:ring-1 focus:ring-neon transition-colors"
          />
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-500/10 rounded p-3">
            {error}
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button type="submit" disabled={isSubmitting} className="btn-primary w-full md:w-auto">
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" /> Submitting Review...
              </>
            ) : (
              "Submit Feedback"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
