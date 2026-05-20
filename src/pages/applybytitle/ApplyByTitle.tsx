import PageLayout from "@/components/layout/PageLayout";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import ApplyByTitleCandidateCard from "@/features/applybytitle/components/ApplyByTitleCandidateCard";
import { Input } from "@/components/ui/input";
import SectionPagination from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ApplyByTitleFilterPopup from "@/pages/applybytitle/ApplyByTitleFilterPopup";
import ApplyByTitleJobDetailPopup from "@/pages/applybytitle/ApplyByTitleJobDetailPopup";
import ApplyByTitleNewAppliedPopup from "@/pages/applybytitle/ApplyByTitleNewAppliedPopup";
import ApplyByTitleSkillPopup from "@/pages/applybytitle/ApplyByTitleSkillPopup";
import type {
  ApplyStatusFilter,
  CandidateCard,
} from "@/types/domain/apply-by-title";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

const perPageBySection = {
  newApplied: 6,
  applied: 15,
  interview: 6,
  accept: 6,
  reject: 9,
} as const;

const applybytitleMock: CandidateCard[] = [
  {
    id: 1,
    name: "Chotanansub Sophaken",
    status: "Apply",
    section: "newApplied",
    appliedAt: "2h ago",
    badgeText: "New",
    skillMatch: "3 Skill Match",
    highlightVariant: "gradient",
  },
  {
    id: 2,
    name: "Nattapong K.",
    status: "Apply",
    section: "applied",
    appliedAt: "1d ago",
    skillMatch: "2 Skill Match",
  },
  {
    id: 3,
    name: "Sudarat P.",
    status: "Interview",
    section: "interview",
    appliedAt: "3d ago",
    skillMatch: "4 Skill Match",
    highlightVariant: "pink",
  },
  {
    id: 4,
    name: "Kanin T.",
    status: "Accept",
    section: "accept",
    appliedAt: "5d ago",
    skillMatch: "3 Skill Match",
    highlightVariant: "green",
  },
  {
    id: 5,
    name: "Ploy N.",
    status: "Reject",
    section: "reject",
    appliedAt: "7d ago",
    skillMatch: "2 Skill Match",
  },
];

export default function ApplyByTitlePage() {
  const { title } = useParams();
  const decodedTitle = title ?? "Personal Assistant 25 - 35 K (WFH 80%)";
  const gradientBorderStyle = {
    border: "1px solid transparent",
    backgroundImage:
      "linear-gradient(var(--card), var(--card)), var(--gradient-primary)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  } as const;

  const [newAppliedPage, setNewAppliedPage] = useState(1);
  const [appliedPage, setAppliedPage] = useState(1);
  const [interviewPage, setInterviewPage] = useState(1);
  const [acceptPage, setAcceptPage] = useState(1);
  const [rejectPage, setRejectPage] = useState(1);
  const [selectedStars, setSelectedStars] = useState<Record<number, boolean>>(
    {},
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [applyStatusFilter, setApplyStatusFilter] =
    useState<ApplyStatusFilter>("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
  const [isFilterPopupOpen, setIsFilterPopupOpen] = useState(false);
  const [isJobDetailPopupOpen, setIsJobDetailPopupOpen] = useState(false);
  const [isNewAppliedPopupOpen, setIsNewAppliedPopupOpen] = useState(false);
  const [isSkillPopupOpen, setIsSkillPopupOpen] = useState(false);
  const [selectedSkillName, setSelectedSkillName] = useState("React");
  const [selectedNewAppliedCard, setSelectedNewAppliedCard] =
    useState<CandidateCard | null>(null);

  const skillNames = ["React", "React"];

  const sectionedCards = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    const matchesSearchAndFilter = (card: CandidateCard) => {
      const matchesSearch =
        normalizedQuery.length === 0 ||
        [card.name, card.status, card.appliedAt, card.skillMatch].some(
          (value) => value.toLowerCase().includes(normalizedQuery),
        );

      const matchesApplyStatus =
        applyStatusFilter === "all" ||
        card.status.toLowerCase() === applyStatusFilter;

      return matchesSearch && matchesApplyStatus;
    };

    const sortCards = (cards: CandidateCard[]) => {
      const sortedCards = [...cards].sort(
        (firstCard, secondCard) => firstCard.id - secondCard.id,
      );
      return sortBy === "oldest" ? sortedCards : sortedCards.reverse();
    };

    const filteredCards = applybytitleMock.filter(matchesSearchAndFilter);

    return {
      newApplied: sortCards(
        filteredCards.filter((item) => item.section === "newApplied"),
      ),
      applied: sortCards(
        filteredCards.filter((item) => item.section === "applied"),
      ),
      interview: sortCards(
        filteredCards.filter((item) => item.section === "interview"),
      ),
      accept: sortCards(
        filteredCards.filter((item) => item.section === "accept"),
      ),
      reject: sortCards(
        filteredCards.filter((item) => item.section === "reject"),
      ),
    };
  }, [applyStatusFilter, searchQuery, sortBy]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setNewAppliedPage(1);
    setAppliedPage(1);
    setInterviewPage(1);
    setAcceptPage(1);
    setRejectPage(1);
  }, [applyStatusFilter, searchQuery, sortBy]);

  useEffect(() => {
    const newAppliedPages = Math.max(
      1,
      Math.ceil(sectionedCards.newApplied.length / perPageBySection.newApplied),
    );
    const appliedPages = Math.max(
      1,
      Math.ceil(sectionedCards.applied.length / perPageBySection.applied),
    );
    const interviewPages = Math.max(
      1,
      Math.ceil(sectionedCards.interview.length / perPageBySection.interview),
    );
    const acceptPages = Math.max(
      1,
      Math.ceil(sectionedCards.accept.length / perPageBySection.accept),
    );
    const rejectPages = Math.max(
      1,
      Math.ceil(sectionedCards.reject.length / perPageBySection.reject),
    );

    if (newAppliedPage > newAppliedPages) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNewAppliedPage(newAppliedPages);
    }

    if (appliedPage > appliedPages) {
      setAppliedPage(appliedPages);
    }

    if (interviewPage > interviewPages) {
      setInterviewPage(interviewPages);
    }

    if (acceptPage > acceptPages) {
      setAcceptPage(acceptPages);
    }

    if (rejectPage > rejectPages) {
      setRejectPage(rejectPages);
    }
  }, [
    acceptPage,
    appliedPage,
    interviewPage,
    newAppliedPage,
    rejectPage,
    sectionedCards.accept.length,
    sectionedCards.applied.length,
    sectionedCards.interview.length,
    sectionedCards.newApplied.length,
    sectionedCards.reject.length,
  ]);

  const getPageItems = <T,>(items: T[], page: number, perPage: number) => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  };

  const hasAnyResults =
    sectionedCards.newApplied.length > 0 ||
    sectionedCards.applied.length > 0 ||
    sectionedCards.interview.length > 0 ||
    sectionedCards.accept.length > 0 ||
    sectionedCards.reject.length > 0;

  const noResultReason = searchQuery.trim()
    ? `"${searchQuery.trim()}"`
    : applyStatusFilter !== "all"
      ? applyStatusFilter
      : "your criteria";

  const toggleStar = (cardId: number) => {
    setSelectedStars((prev) => ({
      ...prev,
      [cardId]: !prev[cardId],
    }));
  };

  const handleOpenNewAppliedPopup = (card: CandidateCard) => {
    setSelectedNewAppliedCard(card);
    setIsNewAppliedPopupOpen(true);
  };

  const handleOpenSkillPopup = (skillName: string) => {
    setSelectedSkillName(skillName);
    setIsSkillPopupOpen(true);
  };

  return (
    <PageLayout>
      <div className="w-full bg-background px-6 py-6 overflow-y-auto">
        <div className="mx-auto max-w-6xl ml-4">
          <div className="mb-6 mx-[1%]">
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/applymonitor">Apply</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link to="/applymonitor">Apply Monitor</Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage className="truncate max-w-[50ch] align-bottom inline-block">
                    {decodedTitle}
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-medium">{decodedTitle}</h1>
              <p className="text-[20px] font-normal">
                Status: <span className="text-primary">Active</span>
              </p>
            </div>
            <Button
              variant="outline"
              size="xs"
              className="rounded-full border-muted-foreground/30 bg-transparent text-muted-foreground hover:bg-transparent"
              onClick={() => setIsJobDetailPopupOpen(true)}
            >
              View Job Detail
            </Button>
          </div>

          <section className="mb-4">
            <p className="mb-2 text-sm font-medium">Skill Use In This Job</p>
            <div className="flex flex-wrap items-center gap-2">
              {skillNames.map((skillName, index) => (
                <Button
                  key={`${skillName}-${index}`}
                  variant="outline"
                  size="xs"
                  className="rounded-full bg-transparent hover:bg-transparent"
                  style={gradientBorderStyle}
                  onClick={() => handleOpenSkillPopup(skillName)}
                >
                  <span className="gradient-text">{skillName}</span>
                </Button>
              ))}
            </div>
          </section>

          <section className="mb-3 grid grid-cols-1 gap-2 md:grid-cols-10">
            <div className="md:col-span-4">
              <p className="text-foreground mb-1 text-base font-medium">
                Search
              </p>
              <Input
                placeholder="name"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </div>
            <div className="md:col-span-3">
              <p className="text-foreground mb-1 text-base font-medium">
                Apply Status
              </p>
              <Select
                value={applyStatusFilter}
                onValueChange={(value) =>
                  setApplyStatusFilter(value as ApplyStatusFilter)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="placeholder" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="apply">Apply</SelectItem>
                  <SelectItem value="interview">Interview</SelectItem>
                  <SelectItem value="accept">Accept</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <p className="text-foreground mb-1 text-base font-medium">
                Sort By
              </p>
              <Select
                value={sortBy}
                onValueChange={(value) =>
                  setSortBy(value as "newest" | "oldest")
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent position="item-aligned">
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="oldest">Oldest</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </section>

          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant="gradient" className="rounded-full text-[12px] py-3">
              <span className="gradient-text">Match more 5 skills ✕</span>
            </Badge>
            <Badge variant="gradient" className="rounded-full text-[12px] py-3">
              <span className="gradient-text">Star only ✕</span>
            </Badge>
            <Badge variant="gradient" className="rounded-full text-[12px] py-3">
              <span className="gradient-text">
                Had experience to use skill in project ✕
              </span>
            </Badge>
            <ApplyByTitleFilterPopup
              open={isFilterPopupOpen}
              onOpenChange={setIsFilterPopupOpen}
            >
              <button
                type="button"
                onClick={() => setIsFilterPopupOpen(true)}
                className="group cursor-pointer mt-[-0.3%] rounded-full"
              >
                <Badge
                  variant="outline"
                  className={`rounded-full bg-transparent px-3 py-3 text-sm font-medium transition-all duration-200 ${
                    isFilterPopupOpen
                      ? "bg-linear-to-r from-primary/10 to-secondary/10"
                      : "group-hover:bg-linear-to-r group-hover:from-primary/10 group-hover:to-secondary/10"
                  }`}
                  style={gradientBorderStyle}
                >
                  <span className="gradient-text">+ New filter</span>
                </Badge>
              </button>
            </ApplyByTitleFilterPopup>
          </div>

          {hasAnyResults ? (
            <>
              {sectionedCards.newApplied.length > 0 && (
                <section className="mb-4">
                  <h2 className="text-sm font-semibold mb-2">New Applied</h2>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    {getPageItems(
                      sectionedCards.newApplied,
                      newAppliedPage,
                      perPageBySection.newApplied,
                    ).map((card) => (
                      <ApplyByTitleCandidateCard
                        key={card.id}
                        card={card}
                        variant="newApplied"
                        isStarSelected={Boolean(selectedStars[card.id])}
                        onToggleStar={toggleStar}
                        onOpenDetail={handleOpenNewAppliedPopup}
                      />
                    ))}
                  </div>
                  <SectionPagination
                    total={sectionedCards.newApplied.length}
                    currentPage={newAppliedPage}
                    onPageChange={setNewAppliedPage}
                    perPage={perPageBySection.newApplied}
                    compact
                  />
                </section>
              )}

              {sectionedCards.applied.length > 0 && (
                <section className="mb-4">
                  <h2 className="text-sm font-semibold mb-2">Applied</h2>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    {getPageItems(
                      sectionedCards.applied,
                      appliedPage,
                      perPageBySection.applied,
                    ).map((card) => (
                      <ApplyByTitleCandidateCard
                        key={card.id}
                        card={card}
                        variant="applied"
                        isStarSelected={Boolean(selectedStars[card.id])}
                        onToggleStar={toggleStar}
                        onOpenDetail={handleOpenNewAppliedPopup}
                      />
                    ))}
                  </div>
                  <SectionPagination
                    total={sectionedCards.applied.length}
                    currentPage={appliedPage}
                    onPageChange={setAppliedPage}
                    perPage={perPageBySection.applied}
                    compact
                  />
                </section>
              )}

              {sectionedCards.interview.length > 0 && (
                <section className="mb-4">
                  <h2 className="text-sm font-semibold mb-2">Interview</h2>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    {getPageItems(
                      sectionedCards.interview,
                      interviewPage,
                      perPageBySection.interview,
                    ).map((card) => (
                      <ApplyByTitleCandidateCard
                        key={card.id}
                        card={card}
                        variant="interview"
                        isStarSelected={Boolean(selectedStars[card.id])}
                        onToggleStar={toggleStar}
                        onOpenDetail={handleOpenNewAppliedPopup}
                      />
                    ))}
                  </div>
                  <SectionPagination
                    total={sectionedCards.interview.length}
                    currentPage={interviewPage}
                    onPageChange={setInterviewPage}
                    perPage={perPageBySection.interview}
                    compact
                  />
                </section>
              )}

              {sectionedCards.accept.length > 0 && (
                <section className="mb-4">
                  <h2 className="text-sm font-semibold mb-2">Accept</h2>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    {getPageItems(
                      sectionedCards.accept,
                      acceptPage,
                      perPageBySection.accept,
                    ).map((card) => (
                      <ApplyByTitleCandidateCard
                        key={card.id}
                        card={card}
                        variant="accept"
                        isStarSelected={Boolean(selectedStars[card.id])}
                        onToggleStar={toggleStar}
                        onOpenDetail={handleOpenNewAppliedPopup}
                      />
                    ))}
                  </div>
                  <SectionPagination
                    total={sectionedCards.accept.length}
                    currentPage={acceptPage}
                    onPageChange={setAcceptPage}
                    perPage={perPageBySection.accept}
                    compact
                  />
                </section>
              )}

              {sectionedCards.reject.length > 0 && (
                <section className="mb-4">
                  <h2 className="text-sm font-semibold mb-2">Reject</h2>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
                    {getPageItems(
                      sectionedCards.reject,
                      rejectPage,
                      perPageBySection.reject,
                    ).map((card) => (
                      <ApplyByTitleCandidateCard
                        key={card.id}
                        card={card}
                        variant="reject"
                        isStarSelected={Boolean(selectedStars[card.id])}
                        onToggleStar={toggleStar}
                        onOpenDetail={handleOpenNewAppliedPopup}
                      />
                    ))}
                  </div>
                  <SectionPagination
                    total={sectionedCards.reject.length}
                    currentPage={rejectPage}
                    onPageChange={setRejectPage}
                    perPage={perPageBySection.reject}
                    compact
                  />
                </section>
              )}
            </>
          ) : (
            <div className="mb-6 rounded-xl border border-border bg-card px-4 py-6 text-center">
              <p className="text-base font-medium text-foreground">
                No result match {noResultReason}
              </p>
            </div>
          )}

          <ApplyByTitleJobDetailPopup
            open={isJobDetailPopupOpen}
            onOpenChange={setIsJobDetailPopupOpen}
            jobTitle={decodedTitle}
          />

          <ApplyByTitleNewAppliedPopup
            open={isNewAppliedPopupOpen}
            onOpenChange={setIsNewAppliedPopupOpen}
            card={selectedNewAppliedCard}
          />

          <ApplyByTitleSkillPopup
            open={isSkillPopupOpen}
            onOpenChange={setIsSkillPopupOpen}
            skillName={selectedSkillName}
          />
        </div>
      </div>
    </PageLayout>
  );
}
