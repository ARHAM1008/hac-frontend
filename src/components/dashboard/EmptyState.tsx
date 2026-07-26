import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  Icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ Icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="glass-panel flex flex-col items-center justify-center gap-3 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">
        <Icon size={22} className="text-ink-faint" aria-hidden="true" />
      </div>
      <div>
        <p className="font-semibold text-ink text-sm">{title}</p>
        <p className="mt-1 text-xs text-ink-muted leading-relaxed max-w-xs">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-neon/10 px-4 py-2 text-xs font-medium text-neon transition-colors hover:bg-neon/20"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
