import PageLayout from "@/components/layout/PageLayout";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import SectionPagination from "@/components/ui/pagination";
import Multiselect, {
  type MultiselectOption,
} from "@/components/ui/multiselect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  apiApplyMonitorSearchJob,
  apiGetApplyMonitorJobDetail,
} from "@/services/applymonitorService";
import { apiGetUtilityOptionType } from "@/services/utilityService";
import { formatDate } from "@/utils/formatDate";
import type { JobMonitorCard } from "@/types/domain/job-monitor";
import type { ApplyMonitorJobDetailResponse } from "@/types/applymonitorTypes";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import JobMonitorDetailPopup from "@/pages/jobmonitor/JobMonitorDetailPopup";

export default function JobMonitorPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusValues, setStatusValues] = useState<string[]>([]);
  const [sortById, setSortById] = useState<string>("");
  const [isDetailPopupOpen, setIsDetailPopupOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<JobMonitorCard | null>(null);
  const [latestCards, setLatestCards] = useState<JobMonitorCard[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [jobStatusOptions, setJobStatusOptions] = useState<MultiselectOption[]>(
    [],
  );
  const [sortByOptions, setSortByOptions] = useState<
    Array<{ id: string; label: string }>
  >([]);
  const [jobDetailsMap, setJobDetailsMap] = useState<
    Record<string, ApplyMonitorJobDetailResponse>
  >({});
  const cardsPerPage = 10;

  const gradientBorderStyle = {
    border: "1px solid transparent",
    backgroundImage:
      "linear-gradient(var(--card), var(--card)), var(--gradient-primary)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  } as const;

  const apiSortById = sortById ? Number(sortById) : undefined;

  // Fetch status and sort options from API
  useEffect(() => {
    let isCancelled = false;

    const fetchOptions = async () => {
      try {
        const response = await apiGetUtilityOptionType();
        if (isCancelled) return;

        const statusData = response.data?.job_status ?? [];
        const sortData = response.data?.sort_by ?? [];

        const mappedStatusOptions: MultiselectOption[] = statusData.map(
          (item) => ({
            label: item.text_eng,
            value: String(item.id),
          }),
        );

        const mappedSortOptions = sortData.map((item) => ({
          id: String(item.id),
          label: item.text_eng,
        }));

        setJobStatusOptions(mappedStatusOptions);
        setSortByOptions(mappedSortOptions);
      } catch {
        // Options fetch failure is non-blocking
      }
    };

    void fetchOptions();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortById]);

  useEffect(() => {
    let isCancelled = false;

    const fetchJobs = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");

        const response = await apiApplyMonitorSearchJob({
          search: searchQuery.trim() || undefined,
          sortById: apiSortById,
          page: currentPage - 1,
          limit: cardsPerPage,
        });

        if (isCancelled) return;

        const data = response.data;
        const mappedCards: JobMonitorCard[] = (data.items ?? []).map(
          (item, index) => {
            const dateRangeParts = (item.date_range ?? "").split(" - ");
            const startDate = dateRangeParts[0] ?? "";
            const endDate = dateRangeParts[1] ?? "";
            const period =
              startDate && endDate
                ? `${formatDate({ date: startDate, format: "DD/MM/YYYY" })} - ${formatDate({ date: endDate, format: "DD/MM/YYYY" })}`
                : item.date_range;

            return {
              id: currentPage * 1000 + index,
              jobId: item.job_id,
              title: item.job_name,
              status: item.status,
              jobStatus:
                item.status?.toLowerCase() === "open" ? "open" : "closed",
              period,
              applied: `${item.applied_count} Applied`,
              companyName: "-",
              locationPosted: `${item.new_applied_count} New Applied`,
            };
          },
        );

        setLatestCards(mappedCards);
        setTotalPages(Math.max(1, data.total || 1));
      } catch {
        if (isCancelled) return;
        setLatestCards([]);
        setTotalPages(1);
        setErrorMessage("Failed to load job activities");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchJobs();

    return () => {
      isCancelled = true;
    };
  }, [searchQuery, apiSortById, currentPage]);

  // Fetch job details for client-side status filtering
  useEffect(() => {
    if (latestCards.length === 0) return;
    const ids = latestCards
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
  }, [latestCards]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginationTotal =
    latestCards.length === 0 && currentPage === 1
      ? 0
      : totalPages * cardsPerPage;

  // Client-side filter by job status using fetched details
  const displayCards = latestCards.filter((card) => {
    if (statusValues.length === 0) return true;
    const detail = card.jobId ? jobDetailsMap[card.jobId] : undefined;
    if (!detail) return true; // still loading detail, keep visible
    return statusValues.map(Number).includes(detail.status);
  });

  const handleOpenDetailPopup = (card: JobMonitorCard) => {
    setSelectedCard(card);
    setIsDetailPopupOpen(true);
  };

  const renderCard = (card: JobMonitorCard) => (
    <article
      key={card.id}
      className="rounded-xl border border-border bg-card px-4 py-3 min-h-33.5 flex flex-col"
    >
      <h3 className="text-sm font-medium leading-5 line-clamp-2">
        {card.title}
      </h3>
      <p className="mt-1 text-xs">
        Status: <span className="text-primary">{card.status}</span>
      </p>
      <p className="text-muted-foreground text-[11px]">{card.period}</p>
      <p className="text-muted-foreground text-[11px]">{card.applied}</p>

      <div className="mt-auto flex justify-end pt-2">
        <Button
          variant="ghost"
          size="xs"
          className="hover:bg-transparent rounded-full border bg-transparent px-6"
          style={gradientBorderStyle}
          onClick={() => handleOpenDetailPopup(card)}
        >
          <span className="gradient-text">View Job</span>
        </Button>
      </div>
    </article>
  );

  return (
    <PageLayout>
      <div className="w-full bg-background px-6 py-6 overflow-y-auto">
        <div className="mx-auto max-w-6xl ml-4">
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
                  <BreadcrumbPage>Job Monitor</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <h1 className="text-3xl font-medium mt-[3%] ml-[-1%]">Job Monitor</h1>

          <section className="mt-[2%] mb-4 grid grid-cols-1 gap-3 md:grid-cols-10">
            <div className="md:col-span-4">
              <p className="text-foreground mb-1 text-base font-medium">
                Search
              </p>
              <Input
                placeholder="Search name"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <p className="text-foreground mb-1 text-base font-medium">
                Status
              </p>
              <Multiselect
                options={jobStatusOptions}
                selectedValues={statusValues}
                onSelectedValuesChange={setStatusValues}
                placeholder="Select"
              />
            </div>
            <div className="md:col-span-3">
              <p className="text-foreground mb-1 text-base font-medium">
                Sort By
              </p>
              <Select value={sortById} onValueChange={setSortById}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  {sortByOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>

          <section>
            <h2 className="text-foreground mb-2 text-lg font-semibold">
              Latest Job activities
            </h2>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : displayCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No job activities found
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {displayCards.map(renderCard)}
              </div>
            )}

            <SectionPagination
              total={paginationTotal}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              perPage={cardsPerPage}
            />
          </section>

          <JobMonitorDetailPopup
            open={isDetailPopupOpen}
            onOpenChange={setIsDetailPopupOpen}
            card={selectedCard}
          />
        </div>
      </div>
    </PageLayout>
  );
}
