import PageLayout from "@/components/layout/PageLayout";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
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
import ApplymonitorJobDetailPopup from "@/pages/applymonitor/ApplymonitorJobDetailPopup";
import {
  apiGetApplyMonitorJobDetail,
  apiGetApplyMonitorJobApplies,
  apiPatchApplyMonitorApplyViewed,
} from "@/services/applymonitorService";
import type {
  ApplyMonitorJobDetailResponse,
  ApplyMonitorJobApplyItem,
} from "@/services/applymonitorService";
import { apiGetUtilityOptionType } from "@/services/utilityService";
import type { UtilityOptionTypeItem } from "@/types/utilityTypes";
import type { ApplicationCard } from "@/types/domain/apply-monitor";
import { Star } from "lucide-react";
import { formatDate } from "@/utils/formatDate";

const CARDS_PER_PAGE = 6;

function StatusText({ status }: { status: string }) {
  return <span className="text-primary">{status}</span>;
}

function mapApplyItemToCard(
  item: ApplyMonitorJobApplyItem,
  index: number,
): ApplicationCard {
  const appliedAt = formatDate({
    date: item.created_at,
    format: "DD/MM/YYYY HH:mm",
  });
  return {
    id: index + 1,
    applyId: item.id,
    create_date: item.created_at,
    title: item.user_name,
    status: item.status_name?.en ?? String(item.status),
    detail: appliedAt ? `Applied: ${appliedAt}` : "",
    skillMatch: `${item.match_skill} Skill Match`,
    highlighted: !item.is_viewed,
  };
}

export function ApplymonitorJobPage() {
  const { jobId } = useParams<{ jobId: string }>();

  // ── Job detail ─────────────────────────────────────────────────────────
  const [jobDetail, setJobDetail] =
    useState<ApplyMonitorJobDetailResponse | null>(null);
  const [jobDetailLoading, setJobDetailLoading] = useState(false);

  // ── New Applied (not viewed) ───────────────────────────────────────────
  const [newApplySource, setNewApplySource] = useState<ApplicationCard[]>([]);
  const [newApplyPage, setNewApplyPage] = useState(1);
  const [newApplyRefreshTick, setNewApplyRefreshTick] = useState(0);

  // ── Applied (viewed) ──────────────────────────────────────────────────
  const [applySource, setApplySource] = useState<ApplicationCard[]>([]);
  const [appliesLoading, setAppliesLoading] = useState(false);
  const [applyPage, setApplyPage] = useState(1);

  // ── Filters ────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [applyStatusValues, setApplyStatusValues] = useState<string[]>([]);
  const [sortById, setSortById] = useState("");

  // ── Options ────────────────────────────────────────────────────────────
  const [applyStatusOptions, setApplyStatusOptions] = useState<
    { label: string; value: string }[]
  >([]);
  const [sortByOptions, setSortByOptions] = useState<
    { label: string; value: string }[]
  >([]);

  // ── Popup ──────────────────────────────────────────────────────────────
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<ApplicationCard | null>(
    null,
  );
  const [selectedStars, setSelectedStars] = useState<Record<string, boolean>>(
    {},
  );
  const [isJobDetailPopupOpen, setIsJobDetailPopupOpen] = useState(false);

  const gradientBorderStyle = {
    border: "1px solid transparent",
    backgroundImage:
      "linear-gradient(var(--card), var(--card)), var(--gradient-primary)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  } as const;

  const toggleStar = (key: string) => {
    setSelectedStars((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleOpenDetail = (card: ApplicationCard) => {
    if (card.applyId && card.highlighted) {
      void apiPatchApplyMonitorApplyViewed(card.applyId, { is_viewed: true });
      setNewApplySource((prev) =>
        prev.filter((item) => item.applyId !== card.applyId),
      );
      setApplySource((prev) => [{ ...card, highlighted: false }, ...prev]);
    }
    setSelectedCard(card);
    setIsDetailOpen(true);
  };

  // ── Load utility options ───────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGetUtilityOptionType();
        const data = res.data;
        const toOptions = (arr: UtilityOptionTypeItem[]) =>
          arr.map((item) => ({ label: item.text_eng, value: String(item.id) }));
        setApplyStatusOptions(toOptions(data.apply_status ?? []));
        setSortByOptions(toOptions(data.sort_by ?? []));
      } catch {
        // leave options empty
      }
    };
    void load();
  }, []);

  // ── Load job detail ────────────────────────────────────────────────────
  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    const load = async () => {
      setJobDetailLoading(true);
      try {
        const res = await apiGetApplyMonitorJobDetail(jobId);
        if (!cancelled) setJobDetail(res.data);
      } catch {
        // leave null
      } finally {
        if (!cancelled) setJobDetailLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [jobId]);

  useEffect(() => {
    setNewApplyPage(1);
    setApplyPage(1);
  }, [searchQuery, applyStatusValues, sortById]);

  // ── Load applies once, then split by is_viewed ────────────────────────
  useEffect(() => {
    if (!jobId) return;
    let cancelled = false;
    const load = async () => {
      setAppliesLoading(true);
      try {
        const applyStatusId =
          applyStatusValues.length > 0
            ? Number(applyStatusValues[0])
            : undefined;
        const sortByIdNum = sortById ? Number(sortById) : undefined;
        const limit = 100;
        let page = 0;
        let hasMore = true;
        const allItems: ApplyMonitorJobApplyItem[] = [];

        while (hasMore) {
          const res = await apiGetApplyMonitorJobApplies(jobId, {
            search: searchQuery.trim() || undefined,
            applyStatusId,
            sortById: sortByIdNum,
            page,
            limit,
          });

          const items = res.data.data ?? [];
          allItems.push(...items);

          page += 1;
          const total = res.data.total ?? allItems.length;
          hasMore = page * limit < total && items.length > 0;
        }

        if (cancelled) return;
        const unviewed = allItems.filter((item) => !item.is_viewed);
        const viewed = allItems.filter((item) => item.is_viewed);

        setNewApplySource(unviewed.map(mapApplyItemToCard));
        setApplySource(viewed.map(mapApplyItemToCard));
      } catch {
        if (!cancelled) {
          setNewApplySource([]);
          setApplySource([]);
        }
      } finally {
        if (!cancelled) setAppliesLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [jobId, searchQuery, applyStatusValues, sortById, newApplyRefreshTick]);

  const newApplyTotal = newApplySource.length;
  const applyTotal = applySource.length;
  const newApplyCards = newApplySource.slice(
    (newApplyPage - 1) * CARDS_PER_PAGE,
    newApplyPage * CARDS_PER_PAGE,
  );
  const applyCards = applySource.slice(
    (applyPage - 1) * CARDS_PER_PAGE,
    applyPage * CARDS_PER_PAGE,
  );

  const jobName = jobDetail?.name ?? "Job Detail";
  const jobStatusName = jobDetail?.status_name ?? "";
  const skills = jobDetail?.skills ?? [];

  return (
    <PageLayout>
      <div className="p-6">
        <div className="mx-auto max-w-6xl space-y-4">
          {/* ── Breadcrumb ─────────────────────────────────────────────── */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link to="/applymonitor">Apply Monitor</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {jobDetailLoading ? "Loading..." : jobName}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* ── Header ─────────────────────────────────────────────────── */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-foreground text-xl font-semibold">
                {jobName}
              </h1>
              <p className="text-sm">
                Status: <StatusText status={jobStatusName} />
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full shrink-0"
              onClick={() => setIsJobDetailPopupOpen(true)}
            >
              View Job Detail
            </Button>
          </div>

          {/* ── Skills ─────────────────────────────────────────────────── */}
          {skills.length > 0 && (
            <div>
              <p className="text-foreground mb-1.5 text-sm font-medium">
                Skill Use In This Job
              </p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <Badge
                    key={skill.id}
                    variant="ghost"
                    className="rounded-full border border-primary/40 bg-transparent text-primary"
                  >
                    {skill.skill_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* ── Filters ────────────────────────────────────────────────── */}
          <section className="grid grid-cols-1 gap-3 md:grid-cols-12">
            <div className="md:col-span-5">
              <p className="text-foreground mb-1 text-xs">Search</p>
              <Input
                placeholder="name"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-4">
              <p className="text-foreground mb-1 text-xs">Apply Status</p>
              <Multiselect
                placeholder="placeholder"
                options={applyStatusOptions}
                selectedValues={applyStatusValues}
                onSelectedValuesChange={setApplyStatusValues}
              />
            </div>
            <div className="md:col-span-3">
              <p className="text-foreground mb-1 text-xs">Sort By</p>
              <ToggleSelect
                placeholder="Select"
                options={sortByOptions}
                value={sortById}
                onValueChange={setSortById}
              />
            </div>
          </section>

          {/* ── New Applied ─────────────────────────────────────────────── */}
          <section className="mb-3">
            <h2 className="text-foreground mb-2 text-lg font-semibold">
              New Applied
            </h2>
            {appliesLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : newApplyCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No new applies found
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {newApplyCards.map((card) => {
                  const starKey = `new-${card.id}`;
                  const isStarSelected = Boolean(selectedStars[starKey]);
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
                      className="rounded-xl bg-card px-3 py-2.5 min-h-34.5 flex flex-col"
                      style={gradientBorderStyle}
                    >
                      <div className="mb-1 flex items-center gap-1.5 text-sm font-normal text-foreground">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(starKey);
                          }}
                          aria-label={isStarSelected ? "Unselect" : "Select"}
                          className="rounded-sm bg-transparent p-0 hover:bg-transparent"
                        >
                          <Star
                            className={
                              isStarSelected
                                ? "size-3.5 fill-yellow-400 text-yellow-400"
                                : "text-foreground size-3.5"
                            }
                          />
                        </button>
                        <span>{card.title}</span>
                      </div>
                      <p className="text-xs">
                        Status: <StatusText status={card.status} />
                      </p>
                      <p className="text-muted-foreground mb-2 text-[11px]">
                        {card.detail}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                        <Badge variant="gradient" className="rounded-full">
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
                          <span className="gradient-text">See Detail</span>
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
            <SectionPagination
              total={newApplyTotal}
              currentPage={newApplyPage}
              onPageChange={setNewApplyPage}
              perPage={CARDS_PER_PAGE}
            />
          </section>

          {/* ── Applied ─────────────────────────────────────────────────── */}
          <section>
            <h2 className="text-foreground mb-2 text-lg font-semibold">
              Applied
            </h2>
            {appliesLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : applyCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">No applies found</p>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {applyCards.map((card) => {
                  const starKey = `apply-${card.id}`;
                  const isStarSelected = Boolean(selectedStars[starKey]);
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
                      className="rounded-xl border border-border bg-card px-3 py-2.5 min-h-34.5 flex flex-col"
                    >
                      <div className="mb-1 flex items-center gap-1.5 text-sm font-normal text-muted-foreground">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStar(starKey);
                          }}
                          aria-label={isStarSelected ? "Unselect" : "Select"}
                          className="rounded-sm bg-transparent p-0 hover:bg-transparent"
                        >
                          <Star
                            className={
                              isStarSelected
                                ? "size-3.5 fill-yellow-400 text-yellow-400"
                                : "text-muted-foreground size-3.5"
                            }
                          />
                        </button>
                        <span>{card.title}</span>
                        <span className="ml-auto text-[10px] text-muted-foreground">
                          Viewed
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Status: <StatusText status={card.status} />
                      </p>
                      <p className="text-muted-foreground mb-2 text-[11px]">
                        {card.detail}
                      </p>
                      <div className="mt-auto flex items-center justify-between gap-2 pt-1">
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

          <ApplymonitorPopupPage
            open={isDetailOpen}
            onOpenChange={setIsDetailOpen}
            card={selectedCard}
            onRefetch={() => setNewApplyRefreshTick((prev) => prev + 1)}
          />

          <ApplymonitorJobDetailPopup
            open={isJobDetailPopupOpen}
            onOpenChange={setIsJobDetailPopupOpen}
            jobId={jobId}
            jobTitle={jobName}
          />
        </div>
      </div>
    </PageLayout>
  );
}

export default ApplymonitorJobPage;
