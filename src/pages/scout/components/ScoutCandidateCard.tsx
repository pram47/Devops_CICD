import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ScoutCandidateCardProps } from "@/types/domain/scout";
import { Star } from "lucide-react";

export default function ScoutCandidateCard({
  candidate,
  isStarSelected,
  onToggleStar,
}: ScoutCandidateCardProps) {
  return (
    <article className="rounded-xl border border-border bg-card px-3 py-2.5 min-h-34.5 flex flex-col transition-colors hover:bg-muted/20">
      <div className="mb-1 flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onToggleStar(candidate.id)}
          aria-label={
            isStarSelected ? "Unselect candidate" : "Select candidate"
          }
          className="rounded-sm bg-transparent p-0 hover:bg-transparent"
        >
          <Star
            className={
              isStarSelected
                ? "size-3.5 fill-yellow-400 text-yellow-400"
                : "size-3.5 text-foreground"
            }
          />
        </button>
        <h3 className="truncate text-sm font-normal">{candidate.name}</h3>
      </div>

      <p className="text-xs text-foreground/85">
        Match Job: <span className="line-clamp-1">{candidate.matchJob}</span>
      </p>
      <p className="mb-2 line-clamp-1 text-[11px] text-muted-foreground">
        {candidate.description}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
        <Badge variant="gradient" className="rounded-full text-[10px]">
          <span className="gradient-text">{candidate.skillMatch}</span>
        </Badge>

        <Button
          variant="outline"
          size="xs"
          className="rounded-full border-muted-foreground/30 bg-transparent text-muted-foreground hover:bg-transparent"
          onClick={() =>
            window.open(
              "https://jobby-nine.vercel.app/",
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          See Detail
        </Button>
      </div>
    </article>
  );
}
