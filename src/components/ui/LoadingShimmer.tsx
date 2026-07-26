/**
 * LoadingShimmer.tsx
 *
 * A three-line shimmer skeleton that replaces a loading spinner while waiting
 * for an assistant chat response. Mimics the visual weight of a short paragraph.
 *
 * Theme-aware: uses the .shimmer-line CSS class which is overridden for
 * html.light in index.css.
 */

interface LoadingShimmerProps {
  /** Number of skeleton lines to render. Default: 3 */
  lines?: number;
}

const LINE_WIDTHS = ['85%', '70%', '52%'];
const DELAYS = ['0s', '0.1s', '0.2s'];

export default function LoadingShimmer({ lines = 3 }: LoadingShimmerProps) {
  const count = Math.min(lines, LINE_WIDTHS.length);

  return (
    <div className="space-y-3 py-1" role="status" aria-label="Loading response">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="shimmer-line h-3.5"
          style={{
            width: LINE_WIDTHS[i],
            animationDelay: DELAYS[i],
          }}
          aria-hidden="true"
        />
      ))}
      <span className="sr-only">Loading…</span>
    </div>
  );
}
