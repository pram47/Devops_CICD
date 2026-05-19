import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ApplyByTitleCandidateCardProps } from "@/types/domain/apply-by-title";
import { Star } from "lucide-react";

const gradientCardStyle = {
  border: "1px solid transparent",
  backgroundImage:
    "linear-gradient(var(--card), var(--card)), var(--gradient-primary)",
  backgroundOrigin: "border-box",
  backgroundClip: "padding-box, border-box",
} as const;

export default function ApplyByTitleCandidateCard({
  card,
  variant,
  isStarSelected,
  onToggleStar,
  onOpenDetail,
}: ApplyByTitleCandidateCardProps) {
  const isNewApplied = variant === "newApplied";
  const isInterview = variant === "interview";
  const isAccept = variant === "accept";
  const isReject = variant === "reject";

  const cardClass = isNewApplied
    ? "rounded-xl bg-card px-3 py-2 min-h-30 h-full flex flex-col"
    : isInterview
      ? "rounded-xl border status-interview-border status-interview-bg px-3 py-2 min-h-30 h-full flex flex-col"
      : isAccept
        ? "rounded-xl border status-accept-border status-accept-bg px-3 py-2 min-h-30 h-full flex flex-col"
        : "rounded-xl border border-border bg-card px-3 py-2 min-h-30 h-full flex flex-col";

  const cardStyle = isNewApplied ? gradientCardStyle : undefined;

  const statusClass =
    variant === "interview"
      ? "status-interview-text"
      : variant === "accept"
        ? "status-accept-text"
        : variant === "reject"
          ? "text-destructive"
          : "text-primary";

  const showMessage = isInterview || isAccept;

  return (
    <article
      className={`${cardClass} cursor-pointer`}
      style={cardStyle}
      role="button"
      tabIndex={0}
      onClick={() => onOpenDetail(card)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onOpenDetail(card);
        }
      }}
    >
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onToggleStar(card.id);
            }}
            aria-label={isStarSelected ? "Unstar candidate" : "Star candidate"}
            className="rounded-sm"
          >
            <Star
              className={
                isStarSelected
                  ? "size-3 fill-yellow-400 text-yellow-400"
                  : "size-3 text-foreground"
              }
            />
          </button>
          <span className="text-[11px] font-medium">{card.name}</span>
        </div>
        {card.viewed && (
          <span className="text-muted-foreground text-[10px]">Viewed</span>
        )}
      </div>

      <p className="text-[10px]">
        Status: <span className={statusClass}>{card.status}</span>
      </p>
      <p className="text-muted-foreground text-[10px]">{card.appliedAt}</p>
      {card.badgeText && (
        <p className="mt-1 text-muted-foreground text-[10px]">
          {card.badgeText}
        </p>
      )}

      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
        {isInterview ? (
          <Badge
            variant="outline"
            className="status-interview-bg rounded-full border-transparent text-[10px]"
          >
            <span className="status-interview-text">{card.skillMatch}</span>
          </Badge>
        ) : isAccept ? (
          <Badge
            variant="outline"
            className="status-accept-bg rounded-full border-transparent text-[10px]"
          >
            <span className="status-accept-text">{card.skillMatch}</span>
          </Badge>
        ) : isReject ? (
          <Badge
            variant="outline"
            className="status-reject-bg rounded-full border-transparent text-[10px]"
          >
            <span className="status-reject-text">{card.skillMatch}</span>
          </Badge>
        ) : (
          <Badge variant="gradient" className="rounded-full text-[10px]">
            <span className="gradient-text">{card.skillMatch}</span>
          </Badge>
        )}

        {showMessage ? (
          <Button variant="default" size="xs" className="rounded-full px-3">
            Message
          </Button>
        ) : (
          <Button
            variant="outline"
            size="xs"
            className="rounded-full border-muted-foreground/30 bg-transparent text-muted-foreground hover:bg-transparent"
            onClick={(event) => {
              event.stopPropagation();
              onOpenDetail(card);
            }}
          >
            See Detail
          </Button>
        )}
      </div>
    </article>
  );
}
