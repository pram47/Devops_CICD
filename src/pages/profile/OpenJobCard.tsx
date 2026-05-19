import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { OpenJobCardProps } from "@/types/profilePageTypes";

export default function OpenJobCard({
  jobId,
  title,
  location,
  dateRange,
  applied,
  prefill,
}: OpenJobCardProps) {
  const navigate = useNavigate();

  return (
    <article className="rounded-xl border border-border bg-card px-4 py-3 transition-colors hover:bg-muted/40">
      <p className="line-clamp-2 text-sm font-medium leading-5">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{location}</p>
      <p className="text-xs text-muted-foreground">{dateRange}</p>
      <p className="mt-1 text-xs text-muted-foreground">{applied}</p>

      <div className="mt-3 flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 rounded-full px-4 text-xs"
          onClick={() =>
            navigate("/createjob", {
              state: {
                prefill: {
                  ...(prefill ?? {}),
                  jobId,
                },
              },
            })
          }
        >
          Edit
        </Button>
        <Button
          size="sm"
          className="h-7 rounded-full px-4 text-xs text-white"
          style={{ background: "var(--gradient-primary)" }}
          onClick={() => navigate(`/applymonitor/job/${jobId}`)}
        >
          View Applied
        </Button>
      </div>
    </article>
  );
}
