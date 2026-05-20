import PageLayout from "@/components/layout/PageLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SectionPagination from "@/components/ui/pagination";
import type { ScoutCandidate } from "@/types/domain/scout";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiGetScoutList } from "@/services/scoutService";
import ScoutCandidateCard from "./components/ScoutCandidateCard";

const perPage = 10;

export default function ScoutPage() {
  const [candidates, setCandidates] = useState<ScoutCandidate[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedStars, setSelectedStars] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    let cancelled = false;
    const fetchScoutCandidates = async () => {
      setIsLoading(true);
      setErrorMessage("");
      try {
        const response = await apiGetScoutList({
          search: "",
          job_name: 1,
          page: currentPage - 1,
          limit: perPage,
        });
        if (cancelled) return;

        const mapped: ScoutCandidate[] = (response.data.data ?? []).map(
          (item) => ({
            id: item.id,
            name:
              item.user_name ||
              `${item.first_name ?? ""} ${item.last_name ?? ""}`.trim() ||
              item.email,
            matchJob: "-",
            description: item.email,
            skillMatch: `${item.match_skill} Skill Match`,
            isStar: item.is_star,
          }),
        );

        setCandidates(mapped);
        setTotal(response.data.total ?? 0);
        setSelectedStars((prev) => {
          const next = { ...prev };
          mapped.forEach((candidate) => {
            if (next[candidate.id] === undefined) {
              next[candidate.id] = candidate.isStar;
            }
          });
          return next;
        });
      } catch {
        if (cancelled) return;
        setCandidates([]);
        setTotal(0);
        setErrorMessage("Failed to load scout candidates");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void fetchScoutCandidates();
    return () => {
      cancelled = true;
    };
  }, [currentPage]);

  const pagedCandidates = useMemo(() => candidates, [candidates]);

  const toggleStar = (candidateId: string) => {
    setSelectedStars((previous) => ({
      ...previous,
      [candidateId]: !previous[candidateId],
    }));
  };

  return (
    <PageLayout>
      <div className="w-full overflow-y-auto bg-background px-6 py-6">
        <div className="mx-auto ml-4 max-w-6xl">
          <div className="mb-3 mx-[1%]">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/applymonitor">Apply</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Scout</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="mb-4 flex items-baseline gap-2">
            <h1 className="text-4xl font-semibold text-foreground sm:text-2xl">
              Scout
            </h1>
            <span className="text-4xl font-semibold text-destructive sm:text-2xl">
              (TBC)
            </span>
          </div>

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading...</p>
          ) : errorMessage ? (
            <p className="text-sm text-destructive">{errorMessage}</p>
          ) : pagedCandidates.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No scout candidates found
            </p>
          ) : (
            <section className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {pagedCandidates.map((candidate) => (
                <ScoutCandidateCard
                  key={candidate.id}
                  candidate={candidate}
                  isStarSelected={Boolean(selectedStars[candidate.id])}
                  onToggleStar={toggleStar}
                />
              ))}
            </section>
          )}

          <SectionPagination
            total={total}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
            perPage={perPage}
          />
        </div>
      </div>
    </PageLayout>
  );
}
