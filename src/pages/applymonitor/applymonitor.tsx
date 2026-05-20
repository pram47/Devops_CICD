import PageLayout from "@/components/layout/PageLayout";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Multiselect from "@/components/ui/multiselect";
import ToggleSelect from "@/components/ui/toggle-select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import SectionPagination from "@/components/ui/pagination";
import ApplymonitorPopupPage from "@/pages/applymonitor/ApplymonitorPopupPage";
import {
  apiGetApplyMonitorJobApplies,
  apiApplyMonitorSearchApply,
  apiPatchApplyMonitorApplyStar,
  apiPatchApplyMonitorApplyViewed,
  apiApplyMonitorSearchJob,
  apiGetApplyMonitorApplyDetail,
  apiGetApplyMonitorJobDetail,
} from "@/services/applymonitorService";
import { apiGetUtilityOptionType } from "@/services/utilityService";
import { apiSearchSkills } from "@/services/createjobService";
import type {
  ActivityCard,
  ApplicationCard,
} from "@/types/domain/apply-monitor";
import type { UtilityOptionTypeItem } from "@/types/utilityTypes";
import type {
  ApplyMonitorApplyDetailResponse,
  ApplyMonitorJobDetailResponse,
} from "@/types/applymonitorTypes";
import { Star } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const CARDS_PER_PAGE = 6;

function StatusText({ status }: { status: string }) {
  return <span className="text-primary">{status}</span>;
}

export function ApplymonitorPage() {
  // ── Apply (New Applied) ──────────────────────────────────────────────────
  const [applyCards, setApplyCards] = useState<ApplicationCard[]>([]);
  const [applyTotal, setApplyTotal] = useState(0);
  const [applyLoading, setApplyLoading] = useState(false);
  const [applyError, setApplyError] = useState("");
  const [applyPage, setApplyPage] = useState(1);
  const [applyRefreshTick, setApplyRefreshTick] = useState(0);

  // ── Job (Latest Job activities) ──────────────────────────────────────────
  const [jobCards, setJobCards] = useState<ActivityCard[]>([]);
  const [jobTotal, setJobTotal] = useState(0);
  const [jobLoading, setJobLoading] = useState(false);
  const [jobError, setJobError] = useState("");
  const [jobPage, setJobPage] = useState(1);

  // ── Filters ──────────────────────────────────────────────────────────────
  const [searchApplyQuery, setSearchApplyQuery] = useState("");
  const [applyStatusValues, setApplyStatusValues] = useState<string[]>([]);
  const [jobStatusValues, setJobStatusValues] = useState<string[]>([]);
  const [workCategoryValues, setWorkCategoryValues] = useState<string[]>([]);
  const [searchJobQuery, setSearchJobQuery] = useState("");
  const [skillValues, setSkillValues] = useState<string[]>([]);
  const [applySortById, setApplySortById] = useState("");

  // ── Detail maps for client-side filtering ─────────────────────────────────────
  const [applyDetailsMap, setApplyDetailsMap] = useState<
    Record<string, ApplyMonitorApplyDetailResponse>
  >({});
  const [jobDetailsMap, setJobDetailsMap] = useState<
    Record<string, ApplyMonitorJobDetailResponse>
  >({});

  // ── Skill search suggest ───────────────────────────────────────────────────
  const [skillSearchQuery, setSkillSearchQuery] = useState("");
  const [skillSearchOptions, setSkillSearchOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const skillDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Options ───────────────────────────────────────────────────────────────
  const [applyStatusOptions, setApplyStatusOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [jobStatusOptions, setJobStatusOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [workCategoryOptions, setWorkCategoryOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [sortByOptions, setSortByOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // ── UI ────────────────────────────────────────────────────────────────────
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ApplicationCard | null>(
    null,
  );
  const [applyStars, setApplyStars] = useState<Record<string, boolean>>({});
  const [jobStars, setJobStars] = useState<Record<string, boolean>>({});
  const [starLoading, setStarLoading] = useState<Record<string, boolean>>({});

  const navigate = useNavigate();
  const gradientBorderStyle = {
    border: "1px solid transparent",
    backgroundImage:
      "linear-gradient(var(--card), var(--card)), var(--gradient-primary)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  } as const;

  // ── Load utility options ──────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const response = await apiGetUtilityOptionType();
        const data = response.data;
        const toOptions = (arr: UtilityOptionTypeItem[]) =>
          arr.map((item) => ({ label: item.text_eng, value: String(item.id) }));
        setApplyStatusOptions(toOptions(data.apply_status ?? []));
        setJobStatusOptions(toOptions(data.job_status ?? []));
        setWorkCategoryOptions(toOptions(data.work_category ?? []));
        setSortByOptions(toOptions(data.sort_by ?? []));
      } catch {
        // leave options empty
      }
    };
    void load();
  }, []);

  // ── Skill debounced search ─────────────────────────────────────────────────
  useEffect(() => {
    if (skillDebounceRef.current) clearTimeout(skillDebounceRef.current);
    if (!skillSearchQuery.trim()) {
      setSkillSearchOptions([]);
      return;
    }
    skillDebounceRef.current = setTimeout(async () => {
      try {
        const res = await apiSearchSkills(skillSearchQuery.trim());
        const items = Array.isArray(res.data) ? res.data : [];
        setSkillSearchOptions(
          items
            .map((item) => ({
              label: item.skill_name ?? item.name ?? "",
              value:
                item.skill_id ??
                item.eid ??
                item.skillElementId ??
                item.id ??
                "",
            }))
            .filter((opt) => opt.value !== ""),
        );
      } catch {
        setSkillSearchOptions([]);
      }
    }, 500);
    return () => {
      if (skillDebounceRef.current) clearTimeout(skillDebounceRef.current);
    };
  }, [skillSearchQuery]);

  // ── Reset pages when filters change ──────────────────────────────────────
  useEffect(() => {
    setApplyPage(1);
  }, [searchApplyQuery, applySortById]);
  useEffect(() => {
    setJobPage(1);
  }, [searchJobQuery]);

  // ── Fetch New Applied ─────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setApplyLoading(true);
      setApplyError("");
      try {
        const res = await apiApplyMonitorSearchApply({
          search: searchApplyQuery.trim() || undefined,
          sortById: applySortById ? Number(applySortById) : undefined,
          page: applyPage - 1,
          limit: CARDS_PER_PAGE,
        });
        if (cancelled) return;
        const mapped: ApplicationCard[] = (res.data.data ?? []).map(
          (item, index) => ({
            id: index + 1,
            applyId: item.id,
            create_date: item.created_at,
            title: item.user_name,
            status: item.status_name.en,
            detail: `Applied In: ${item.job_name}`,
            skillMatch: `${item.match_skill} Skill Match`,
            isStar: item.is_star,
            highlighted: !item.is_viewed,
          }),
        );
        setApplyCards(mapped);
        setApplyTotal(res.data.total ?? 0);
        setApplyStars(
          Object.fromEntries(
            mapped.map((item) => [item.applyId, Boolean(item.isStar)]),
          ),
        );
      } catch {
        if (cancelled) return;
        setApplyCards([]);
        setApplyTotal(0);
        setApplyError("Failed to load apply data");
      } finally {
        if (!cancelled) setApplyLoading(false);
      }
    };
    void fetch();
    return () => {
      cancelled = true;
    };
  }, [searchApplyQuery, applySortById, applyPage, applyRefreshTick]);

  // ── Fetch Latest Job activities ───────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setJobLoading(true);
      setJobError("");
      try {
        const res = await apiApplyMonitorSearchJob({
          search: searchJobQuery.trim() || undefined,
          sortById: applySortById ? Number(applySortById) : undefined,
          page: jobPage - 1,
          limit: CARDS_PER_PAGE,
        });
        if (cancelled) return;
        const formatPeriodDate = (iso: string) => {
          const d = new Date(iso);
          if (isNaN(d.getTime())) return iso;
          return d.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
            year: "numeric",
          });
        };
        const formatDateRange = (range: string) => {
          const parts = range.split(" - ");
          if (parts.length !== 2) return range;
          return `${formatPeriodDate(parts[0])} - ${formatPeriodDate(parts[1])}`;
        };
        const mapped: ActivityCard[] = (res.data.items ?? []).map(
          (item, index) => ({
            id: index + 1,
            create_date: new Date().toISOString(),
            title: item.job_name,
            status: item.status,
            period: formatDateRange(item.date_range),
            applied: `${item.applied_count} Applied`,
            badgeText:
              item.new_applied_count > 0
                ? `${item.new_applied_count} New Applied`
                : "",
            highlighted: item.new_applied_count > 0,
            jobId: item.job_id,
          }),
        );
        setJobCards(mapped);
        setJobTotal(res.data.total ?? 0);
      } catch {
        if (cancelled) return;
        setJobCards([]);
        setJobTotal(0);
        setJobError("Failed to load job data");
      } finally {
        if (!cancelled) setJobLoading(false);
      }
    };
    void fetch();
    return () => {
      cancelled = true;
    };
  }, [searchJobQuery, applySortById, jobPage]);

  // ── Fetch apply details for client-side filtering ─────────────────────────
  useEffect(() => {
    if (applyCards.length === 0) return;
    const ids = applyCards
      .map((c) => c.applyId)
      .filter((id): id is string => Boolean(id));
    void Promise.allSettled(
      ids.map((id) => apiGetApplyMonitorApplyDetail(id)),
    ).then((results) => {
      const map: Record<string, ApplyMonitorApplyDetailResponse> = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value.data) {
          map[ids[i]!] = r.value.data;
        }
      });
      setApplyDetailsMap(map);
    });
  }, [applyCards]);

  // ── Fetch job details for client-side filtering ───────────────────────────
  useEffect(() => {
    if (jobCards.length === 0) return;
    const ids = jobCards
      .map((c) => c.jobId)
      .filter((id): id is string => Boolean(id));
    void Promise.allSettled(
      ids.map((id) => apiGetApplyMonitorJobDetail(id)),
    ).then((results) => {
      const map: Record<string, ApplyMonitorJobDetailResponse> = {};
      results.forEach((r, i) => {
        if (r.status === "fulfilled" && r.value.data) {
          map[ids[i]!] = r.value.data;
        }
      });
      setJobDetailsMap(map);
    });
  }, [jobCards]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const toggleApplyStar = async (applyId?: string) => {
    if (!applyId || starLoading[applyId]) return;
    const current = Boolean(applyStars[applyId]);
    const next = !current;

    setApplyStars((prev) => ({ ...prev, [applyId]: next }));
    setStarLoading((prev) => ({ ...prev, [applyId]: true }));

    try {
      const res = await apiPatchApplyMonitorApplyStar(applyId, {
        is_star: next,
      });
      setApplyStars((prev) => ({
        ...prev,
        [applyId]: Boolean(res.data?.is_star),
      }));
    } catch {
      setApplyStars((prev) => ({ ...prev, [applyId]: current }));
    } finally {
      setStarLoading((prev) => ({ ...prev, [applyId]: false }));
    }
  };

  const toggleJobStar = async (jobId?: string) => {
    if (!jobId || starLoading[jobId]) return;
    const current = Boolean(jobStars[jobId]);
    const next = !current;

    setJobStars((prev) => ({ ...prev, [jobId]: next }));
    setStarLoading((prev) => ({ ...prev, [jobId]: true }));

    try {
      const res = await apiGetApplyMonitorJobApplies(jobId, {
        page: 0,
        limit: 100,
      });
      const applyIds = (res.data.data ?? []).map((item) => item.id);

      await Promise.allSettled(
        applyIds.map((applyId) =>
          apiPatchApplyMonitorApplyStar(applyId, { is_star: next }),
        ),
      );
    } catch {
      setJobStars((prev) => ({ ...prev, [jobId]: current }));
    } finally {
      setStarLoading((prev) => ({ ...prev, [jobId]: false }));
    }
  };

  const handleOpenDetail = (card: ApplicationCard) => {
    if (card.applyId && card.highlighted) {
      void apiPatchApplyMonitorApplyViewed(card.applyId, { is_viewed: true });
      setApplyCards((prev) =>
        prev.map((item) =>
          item.applyId === card.applyId
            ? { ...item, highlighted: false }
            : item,
        ),
      );
    }
    setSelectedCard(card);
    setIsDetailOpen(true);
  };

  const handleSeeApplied = (jobId?: string) => {
    if (jobId) {
      // Best-effort update: mark applies in this job as viewed before navigating.
      void (async () => {
        try {
          const limit = 100;
          let page = 0;
          let hasMore = true;

          while (hasMore) {
            const res = await apiGetApplyMonitorJobApplies(jobId, {
              page,
              limit,
            });
            const applies = res.data.data ?? [];
            const unviewedIds = applies
              .filter((item) => !item.is_viewed)
              .map((item) => item.id);

            if (unviewedIds.length > 0) {
              await Promise.allSettled(
                unviewedIds.map((applyId) =>
                  apiPatchApplyMonitorApplyViewed(applyId, { is_viewed: true }),
                ),
              );
            }

            page += 1;
            const total = res.data.total ?? applies.length;
            hasMore = page * limit < total && applies.length > 0;
          }
        } catch {
          // Keep navigation behavior even if patch update fails.
        }
      })();
      navigate(`/applymonitor/job/${jobId}`);
    }
  };

  // Search Apply → only show New Applied (hide Job Activities)
  // Search Job → filter both sections client-side by job name
  // "most applied" sort → only show Latest Job activities

  // Detect if selected sort option is "most applied"
  const selectedSortOption = sortByOptions.find(
    (opt) => opt.value === applySortById,
  );
  const isMostAppliedSort = selectedSortOption
    ? selectedSortOption.label.toLowerCase().includes("most") ||
      selectedSortOption.label.toLowerCase().includes("applied")
    : false;

  const isApplyFilterActive =
    Boolean(searchApplyQuery.trim()) || Boolean(applySortById);
  const isJobSearchActive = Boolean(searchJobQuery.trim());

  // When Search Apply is active OR most-applied sort → hide Job Activities
  // When most-applied sort is active → show only Job Activities (hide New Applied)
  const shouldHideJobSection = isApplyFilterActive && !isMostAppliedSort;
  const shouldHideApplySection = isMostAppliedSort;

  // Client-side filter New Applied cards using fetched apply details
  const clientFilteredApplyCards = applyCards.filter((card) => {
    const detail = card.applyId ? applyDetailsMap[card.applyId] : undefined;
    if (applyStatusValues.length > 0) {
      if (!detail) return true; // still loading detail, keep card visible
      if (!applyStatusValues.map(Number).includes(detail.status)) return false;
    }
    if (skillValues.length > 0) {
      if (!detail) return true;
      const resumeSkillIds =
        detail.resume_detail?.skills?.map((s) => s.skill_id) ?? [];
      if (!skillValues.some((sv) => resumeSkillIds.includes(sv))) return false;
    }
    return true;
  });

  // Filter New Applied cards by job name when Search Job is active
  const filteredApplyCards = isJobSearchActive
    ? clientFilteredApplyCards.filter((card) =>
        card.detail.toLowerCase().includes(searchJobQuery.trim().toLowerCase()),
      )
    : clientFilteredApplyCards;

  const displayApplyCards = filteredApplyCards;

  // Client-side filter Latest Job activities using fetched job details
  const displayJobCards = jobCards.filter((card) => {
    const detail = card.jobId ? jobDetailsMap[card.jobId] : undefined;
    if (jobStatusValues.length > 0) {
      if (!detail) return true;
      if (!jobStatusValues.map(Number).includes(detail.status)) return false;
    }
    if (workCategoryValues.length > 0) {
      if (!detail) return true;
      const catIds = detail.categories?.map((c) => String(c.category_id)) ?? [];
      if (!workCategoryValues.some((wc) => catIds.includes(wc))) return false;
    }
    if (skillValues.length > 0) {
      if (!detail) return true;
      const jobSkillIds = detail.skills?.map((s) => s.skill_id) ?? [];
      if (!skillValues.some((sv) => jobSkillIds.includes(sv))) return false;
    }
    return true;
  });

  const shouldShowNoMatchMessage =
    !applyLoading &&
    !jobLoading &&
    displayApplyCards.length === 0 &&
    (shouldHideJobSection || displayJobCards.length === 0) &&
    (isApplyFilterActive ||
      isJobSearchActive ||
      applyStatusValues.length > 0 ||
      jobStatusValues.length > 0 ||
      workCategoryValues.length > 0 ||
      skillValues.length > 0);

  return (
    <PageLayout>
      <div className="w-full bg-background px-6 py-6 overflow-y-auto">
        <div className="mx-auto my-[-0%] max-w-6xl ml-4">
          {/* Breadcrumb */}
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
                  <BreadcrumbPage>Apply Monitor</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-3xl font-medium mt-[3%] ml-[-1%]">
            Apply Monitor
          </h1>

          {/* ── Filters ─────────────────────────────────────────────────── */}
          <section className="mt-3 mb-4 grid grid-cols-1 gap-x-3 gap-y-2 md:grid-cols-12">
            {/* Row 1 */}
            <div className="md:col-span-4">
              <p className="text-foreground mb-1 text-xs">Search Apply</p>
              <Input
                placeholder="name"
                value={searchApplyQuery}
                onChange={(event) => setSearchApplyQuery(event.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <p className="text-foreground mb-1 text-xs">Apply Status</p>
              <Multiselect
                placeholder="apply status"
                options={applyStatusOptions}
                selectedValues={applyStatusValues}
                onSelectedValuesChange={setApplyStatusValues}
              />
            </div>
            <div className="md:col-span-3">
              <p className="text-foreground mb-1 text-xs">Job Status</p>
              <Multiselect
                options={jobStatusOptions}
                selectedValues={jobStatusValues}
                onSelectedValuesChange={setJobStatusValues}
                placeholder="job status"
              />
            </div>
            <div className="md:col-span-3">
              <p className="text-foreground mb-1 text-xs">Work Category</p>
              <Multiselect
                options={workCategoryOptions}
                selectedValues={workCategoryValues}
                onSelectedValuesChange={setWorkCategoryValues}
                placeholder="work category"
              />
            </div>
            {/* Row 2 */}
            <div className="md:col-span-5">
              <p className="text-foreground mb-1 text-xs">Search Job</p>
              <Input
                placeholder="Job name"
                value={searchJobQuery}
                onChange={(event) => setSearchJobQuery(event.target.value)}
              />
            </div>
            <div className="md:col-span-5">
              <p className="text-foreground mb-1 text-xs">Skill</p>
              <Multiselect
                options={skillSearchOptions}
                selectedValues={skillValues}
                onSelectedValuesChange={setSkillValues}
                placeholder="skill name"
                searchQuery={skillSearchQuery}
                onSearchQueryChange={setSkillSearchQuery}
              />
            </div>
            <div className="md:col-span-2">
              <p className="text-foreground mb-1 text-xs">Sort By</p>
              <ToggleSelect
                placeholder="Select"
                options={sortByOptions}
                value={applySortById}
                onValueChange={setApplySortById}
              />
            </div>
          </section>

          {shouldShowNoMatchMessage && (
            <div className="mb-4 rounded-md border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
              no match Applied or Job
            </div>
          )}

          {/* ── New Applied ──────────────────────────────────────────────── */}
          {!shouldHideApplySection && (
            <section className="mb-3">
              <h2 className="text-foreground mb-2 text-lg font-semibold">
                New Applied
              </h2>
              {applyLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : applyError ? (
                <p className="text-sm text-destructive">{applyError}</p>
              ) : applyCards.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No apply data found
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                  {displayApplyCards.map((card) => {
                    const isInactive = !card.highlighted;
                    const isStarSelected = Boolean(
                      card.applyId ? applyStars[card.applyId] : false,
                    );
                    return (
                      <article
                        key={card.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleOpenDetail(card)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleOpenDetail(card);
                          }
                        }}
                        className={
                          card.highlighted
                            ? "rounded-xl bg-card px-3 py-2.5 min-h-34.5 flex flex-col"
                            : "rounded-xl border border-border bg-card px-3 py-2.5 min-h-34.5 flex flex-col"
                        }
                        style={
                          card.highlighted ? gradientBorderStyle : undefined
                        }
                      >
                        <div
                          className={[
                            "mb-1 flex items-center gap-1.5 text-sm font-normal",
                            isInactive
                              ? "text-muted-foreground"
                              : "text-foreground",
                          ].join(" ")}
                        >
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void toggleApplyStar(card.applyId);
                            }}
                            aria-label={isStarSelected ? "Unselect" : "Select"}
                            className="rounded-sm bg-transparent p-0 hover:bg-transparent"
                          >
                            <Star
                              className={
                                isStarSelected
                                  ? "size-3.5 fill-yellow-400 text-yellow-400"
                                  : isInactive
                                    ? "text-muted-foreground size-3.5"
                                    : "text-foreground size-3.5"
                              }
                            />
                          </button>
                          <span>{card.title}</span>
                        </div>
                        <p
                          className={
                            isInactive
                              ? "text-xs text-muted-foreground"
                              : "text-xs"
                          }
                        >
                          Status: <StatusText status={card.status} />
                        </p>
                        <p className="text-muted-foreground mb-2 text-[11px]">
                          {card.detail}
                        </p>
                        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                          {isInactive ? (
                            <>
                              <Badge
                                variant="ghost"
                                className="rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground"
                              >
                                {card.skillMatch}
                              </Badge>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="hover:bg-transparent rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetail(card);
                                }}
                              >
                                See Detail
                              </Button>
                            </>
                          ) : (
                            <>
                              <Badge
                                variant="gradient"
                                className="rounded-full"
                              >
                                <span className="gradient-text">
                                  {card.skillMatch}
                                </span>
                              </Badge>
                              <Button
                                variant="ghost"
                                size="xs"
                                className="hover:bg-transparent rounded-full border bg-transparent"
                                style={gradientBorderStyle}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenDetail(card);
                                }}
                              >
                                <span className="gradient-text">
                                  See Detail
                                </span>
                              </Button>
                            </>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <SectionPagination
                total={applyTotal}
                currentPage={applyPage}
                onPageChange={setApplyPage}
                perPage={CARDS_PER_PAGE}
              />
            </section>
          )}

          {/* ── Latest Job activities ────────────────────────────────────── */}
          {!shouldHideJobSection && (
            <section>
              <h2 className="text-foreground mb-2 text-lg font-semibold">
                Latest Job activities
              </h2>
              {jobLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : jobError ? (
                <p className="text-sm text-destructive">{jobError}</p>
              ) : displayJobCards.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No job data found
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                  {displayJobCards.map((activity) => {
                    const isInactive = !activity.highlighted;
                    const isStarSelected = Boolean(
                      activity.jobId ? jobStars[activity.jobId] : false,
                    );
                    return (
                      <article
                        key={activity.id}
                        role="button"
                        tabIndex={0}
                        onClick={() => handleSeeApplied(activity.jobId)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleSeeApplied(activity.jobId);
                          }
                        }}
                        className={
                          activity.highlighted
                            ? "rounded-xl bg-card px-3 py-2.5 min-h-34.5 flex flex-col"
                            : "rounded-xl border border-border bg-card px-3 py-2.5 min-h-34.5 flex flex-col"
                        }
                        style={
                          activity.highlighted ? gradientBorderStyle : undefined
                        }
                      >
                        <div className="mb-1 flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              void toggleJobStar(activity.jobId);
                            }}
                            aria-label={isStarSelected ? "Unselect" : "Select"}
                            className="rounded-sm"
                          >
                            <Star
                              className={
                                isStarSelected
                                  ? "size-3.5 fill-yellow-400 text-yellow-400"
                                  : isInactive
                                    ? "text-muted-foreground size-3.5"
                                    : "text-foreground size-3.5"
                              }
                            />
                          </button>
                          <h3
                            className={
                              isInactive
                                ? "text-sm font-medium text-muted-foreground"
                                : "text-sm font-medium"
                            }
                          >
                            {activity.title}
                          </h3>
                        </div>
                        <p
                          className={
                            isInactive
                              ? "text-xs text-muted-foreground"
                              : "text-xs"
                          }
                        >
                          Status: <StatusText status={activity.status} />
                        </p>
                        <p className="text-muted-foreground text-[11px]">
                          {activity.period}
                        </p>
                        <p className="text-muted-foreground mb-2 text-[11px]">
                          {activity.applied}
                        </p>
                        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                          {activity.badgeText ? (
                            isInactive ? (
                              <Badge
                                variant="ghost"
                                className="rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground"
                              >
                                {activity.badgeText}
                              </Badge>
                            ) : (
                              <Badge
                                variant="gradient"
                                className="rounded-full"
                              >
                                <span className="gradient-text">
                                  {activity.badgeText}
                                </span>
                              </Badge>
                            )
                          ) : (
                            <span />
                          )}
                          {isInactive ? (
                            <Button
                              variant="ghost"
                              size="xs"
                              className="hover:bg-transparent rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeeApplied(activity.jobId);
                              }}
                            >
                              See Applied
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="xs"
                              className="hover:bg-transparent rounded-full border bg-transparent"
                              style={gradientBorderStyle}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSeeApplied(activity.jobId);
                              }}
                            >
                              <span className="gradient-text">See Applied</span>
                            </Button>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}

              <SectionPagination
                total={jobTotal}
                currentPage={jobPage}
                onPageChange={setJobPage}
                perPage={CARDS_PER_PAGE}
              />
            </section>
          )}

          <ApplymonitorPopupPage
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            card={selectedCard}
            onRefetch={() => setApplyRefreshTick((prev) => prev + 1)}
          />
        </div>
      </div>
    </PageLayout>
  );
}

export default ApplymonitorPage;
