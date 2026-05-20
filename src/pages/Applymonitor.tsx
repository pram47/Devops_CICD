// import PageLayout from "@/components/layout/PageLayout";
// import { useEffect, useMemo, useState } from "react";
// import { Input } from "@/components/ui/input";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import Multiselect from "@/components/ui/multiselect";
// import {
//   Breadcrumb,
//   BreadcrumbItem,
//   BreadcrumbLink,
//   BreadcrumbList,
//   BreadcrumbPage,
//   BreadcrumbSeparator,
// } from "@/components/ui/breadcrumb";
// import SectionPagination from "@/components/ui/pagination";
// import ApplymonitorPopupPage from "@/pages/applymonitor/ApplymonitorPopupPage";
// import {
//   activityCards,
//   applyStatusOptions,
//   jobStatusOptions,
//   type ApplicationCard,
//   newAppliedCards,
//   skillOptions,
//   workCategoryOptions,
// } from "@/mock/applymonitorMock";
// import { Star } from "lucide-react";
// import { Link, useNavigate } from "react-router-dom";

// function StatusText({ status }: { status: "Apply" | "Open" }) {
//   return (
//     <span className="text-primary">
//       {status}
//     </span>
//   );
// }

// export function ApplymonitorPage() {
//   const [alignItemWithTrigger] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [activityPage, setActivityPage] = useState(1);
//   const [isDetailOpen, setIsDetailOpen] = useState(false);
//   const [selectedNewAppliedCard, setSelectedNewAppliedCard] = useState<ApplicationCard | null>(null);
//   const [sortBy, setSortBy] = useState<"newest" | "oldest">("newest");
//   const [selectedStars, setSelectedStars] = useState<Record<string, boolean>>({});
//   const [searchApplyQuery, setSearchApplyQuery] = useState("");
//   const [searchJobQuery, setSearchJobQuery] = useState("");
//   const [applyStatusValues, setApplyStatusValues] = useState<string[]>([]);
//   const [jobStatusValues, setJobStatusValues] = useState<string[]>([]);
//   const [workCategoryValues, setWorkCategoryValues] = useState<string[]>([]);
//   const [skillValues, setSkillValues] = useState<string[]>([]);
//   const navigate = useNavigate();
//   const gradientBorderStyle = {
//     border: "1px solid transparent",
//     backgroundImage:
//       "linear-gradient(var(--card), var(--card)), var(--gradient-primary)",
//     backgroundOrigin: "border-box",
//     backgroundClip: "padding-box, border-box",
//   } as const;

//   const badgeGradientBackgroundStyle = {
//     backgroundImage:
//       "linear-gradient(to right, color-mix(in oklch, var(--gradient-start) 20%, transparent), color-mix(in oklch, var(--gradient-end) 20%, transparent))",
//   } as const;

//   const getJobStatus = (id: number) => (id % 3 === 0 ? "closed" : "open");

//   const getWorkCategory = (id: number) => {
//     if (id % 3 === 0) {
//       return "operations";
//     }

//     if (id % 2 === 0) {
//       return "technology";
//     }

//     return "business";
//   };

//   const getSkills = (id: number) => {
//     if (id % 3 === 0) {
//       return ["communication", "excel"];
//     }

//     if (id % 2 === 0) {
//       return ["react", "excel"];
//     }

//     return ["react", "communication"];
//   };

//   const matchesSelectedFilters = ({
//     id,
//     status,
//   }: {
//     id: number;
//     status: "Apply" | "Open";
//   }) => {
//     const normalizedStatus = status.toLowerCase();
//     const jobStatus = getJobStatus(id);
//     const workCategory = getWorkCategory(id);
//     const skills = getSkills(id);

//     const matchesApplyStatus =
//       applyStatusValues.length === 0 || applyStatusValues.includes(normalizedStatus);
//     const matchesJobStatus =
//       jobStatusValues.length === 0 || jobStatusValues.includes(jobStatus);
//     const matchesWorkCategory =
//       workCategoryValues.length === 0 || workCategoryValues.includes(workCategory);
//     const matchesSkill =
//       skillValues.length === 0 || skillValues.some((skill) => skills.includes(skill));

//     return (
//       matchesApplyStatus &&
//       matchesJobStatus &&
//       matchesWorkCategory &&
//       matchesSkill
//     );
//   };

//   const sortByCreateDate = <T extends { create_date: string }>(cards: T[]) => {
//     const sortedCards = [...cards].sort(
//       (firstCard, secondCard) =>
//         new Date(firstCard.create_date).getTime() -
//         new Date(secondCard.create_date).getTime(),
//     );

//     return sortBy === "oldest" ? sortedCards : sortedCards.reverse();
//   };

//   const filteredNewAppliedCards = useMemo(
//     () => {
//       const normalizedApplyQuery = searchApplyQuery.trim().toLowerCase();

//       const filteredCards = newAppliedCards.filter((card) => {
//           const matchesSearchApply =
//             normalizedApplyQuery.length === 0 ||
//             card.title.toLowerCase().includes(normalizedApplyQuery);

//           return (
//             matchesSearchApply &&
//             matchesSelectedFilters({ id: card.id, status: card.status })
//           );
//         });

//       return sortByCreateDate(filteredCards);
//     },
//     [searchApplyQuery, applyStatusValues, jobStatusValues, workCategoryValues, skillValues, sortBy],
//   );

//   const filteredActivityCards = useMemo(
//     () => {
//       const normalizedJobQuery = searchJobQuery.trim().toLowerCase();

//       const filteredCards = activityCards.filter((card) => {
//           const matchesSearchJob =
//             normalizedJobQuery.length === 0 ||
//             card.title.toLowerCase().includes(normalizedJobQuery);

//           return (
//             matchesSearchJob &&
//             matchesSelectedFilters({
//               id: card.id + 1000,
//               status: card.status,
//             })
//           );
//         });

//       return sortByCreateDate(filteredCards);
//     },
//     [searchJobQuery, applyStatusValues, jobStatusValues, workCategoryValues, skillValues, sortBy],
//   );

//   const cardsPerPage = 6;
//   const totalCards = filteredNewAppliedCards.length;
//   const totalActivityCards = filteredActivityCards.length;
//   const totalPages = Math.max(1, Math.ceil(totalCards / cardsPerPage));
//   const totalActivityPages = Math.max(1, Math.ceil(totalActivityCards / cardsPerPage));

//   useEffect(() => {
//     if (currentPage > totalPages) {
//       setCurrentPage(totalPages);
//     }
//   }, [currentPage, totalPages]);

//   useEffect(() => {
//     if (activityPage > totalActivityPages) {
//       setActivityPage(totalActivityPages);
//     }
//   }, [activityPage, totalActivityPages]);

//   const startIndex = (currentPage - 1) * cardsPerPage;
//   const endIndex = startIndex + cardsPerPage;
//   const pagedNewAppliedCards = filteredNewAppliedCards.slice(startIndex, endIndex);
//   const activityStartIndex = (activityPage - 1) * cardsPerPage;
//   const activityEndIndex = activityStartIndex + cardsPerPage;
//   const pagedActivityCards = filteredActivityCards.slice(activityStartIndex, activityEndIndex);
//   const isLatestJobOnlyMode = searchJobQuery.trim().length > 0;
//   const isNewAppliedOnlyMode =
//     !isLatestJobOnlyMode &&
//     (searchApplyQuery.trim().length > 0 || applyStatusValues.length > 0);

//   const toggleStar = (starKey: string) => {
//     setSelectedStars((prev) => ({
//       ...prev,
//       [starKey]: !prev[starKey],
//     }));
//   };

//   const handleSeeApplied = (title: string) => {
//     navigate(`/apply/${encodeURIComponent(title)}`);
//   };

//   const handleOpenNewAppliedDetail = (card: ApplicationCard) => {
//     setSelectedNewAppliedCard(card);
//     setIsDetailOpen(true);
//   };

//   return (
//     <PageLayout>
//       <div className="w-full bg-background px-6 py-6 overflow-y-auto">
//         <div className="mx-auto my-[-0%] max-w-6xl ml-4">
//         <div className="mb-3 mx-[1%]">
//           <Breadcrumb>
//             <BreadcrumbList>
//               <BreadcrumbItem>
//                 <BreadcrumbLink asChild>
//                   <Link to="/applymonitor">Apply</Link>
//                 </BreadcrumbLink>
//               </BreadcrumbItem>
//               <BreadcrumbSeparator />
//               <BreadcrumbItem>
//                 <BreadcrumbPage>Apply Monitor</BreadcrumbPage>
//               </BreadcrumbItem>
//             </BreadcrumbList>
//           </Breadcrumb>
//         </div>

//         <h1 className="text-3xl font-medium mt-[3%] ml-[-1%]">Apply Monitor</h1>

//         <section className="mt-[1%] mb-4 grid grid-cols-1 gap-3 md:grid-cols-10">
//           <div className="md:col-span-3">
//             <p className="text-foreground mb-1 text-xs">Search Apply</p>
//             <Input
//               placeholder="name"
//               value={searchApplyQuery}
//               onChange={(event) => setSearchApplyQuery(event.target.value)}
//             />
//           </div>
//           <div className="md:col-span-2">
//             <p className="text-foreground mb-1 text-xs">Apply Status</p>
//             <Multiselect
//               options={applyStatusOptions}
//               selectedValues={applyStatusValues}
//               onSelectedValuesChange={setApplyStatusValues}
//               placeholder="Select"
//             />
//           </div>
//           <div className="md:col-span-2">
//             <p className="text-foreground mb-1 text-xs">Job Status</p>
//             <Multiselect
//               options={jobStatusOptions}
//               selectedValues={jobStatusValues}
//               onSelectedValuesChange={setJobStatusValues}
//               placeholder="Select"
//             />
//           </div>
//           <div className="md:col-span-3">
//             <p className="text-foreground mb-1 text-xs">Work Category</p>
//             <Multiselect
//               options={workCategoryOptions}
//               selectedValues={workCategoryValues}
//               onSelectedValuesChange={setWorkCategoryValues}
//               placeholder="Select"
//             />
//           </div>
//           <div className="md:col-span-4">
//             <p className="text-foreground mb-1 text-xs">Search Job</p>
//             <Input
//               placeholder="Job name"
//               value={searchJobQuery}
//               onChange={(event) => setSearchJobQuery(event.target.value)}
//             />
//           </div>
//           <div className="md:col-span-4">
//             <p className="text-foreground mb-1 text-xs">Skill</p>
//             <Multiselect
//               options={skillOptions}
//               selectedValues={skillValues}
//               onSelectedValuesChange={setSkillValues}
//               placeholder="Select"
//             />
//           </div>
//           <div className="md:col-span-2">
//             <p className="text-foreground mb-1 text-xs">Sort By</p>
//             <Select value={sortBy} onValueChange={(value) => setSortBy(value as "newest" | "oldest")}>
//               <SelectTrigger className="w-full">
//                 <SelectValue placeholder="Select" />
//               </SelectTrigger>
//               <SelectContent position={alignItemWithTrigger ? "item-aligned" : "popper"}>
//                 <SelectItem value="newest">Newest</SelectItem>
//                 <SelectItem value="oldest">Oldest</SelectItem>
//               </SelectContent>
//             </Select>
//           </div>
//         </section>

//         {!isLatestJobOnlyMode && (
//           <section className="mb-3">
//             <h2 className="text-foreground mb-2 text-lg font-semibold">New Applied</h2>
//             <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
//               {pagedNewAppliedCards.map((card) => {
//               const isInactive = !card.highlighted;
//               const starKey = `new-${card.id}`;
//               const isStarSelected = Boolean(selectedStars[starKey]);
//               const cardContent = (
//                 <>
//                   <div
//                     className={[
//                       "mb-1 flex items-center gap-1.5 text-sm font-normal",
//                       isInactive ? "text-muted-foreground" : "text-foreground",
//                     ].join(" ")}
//                   >
//                     <Button
//                       type="button"
//                       onClick={(event) => {
//                         event.stopPropagation();
//                         toggleStar(starKey);
//                       }}
//                       aria-label={isStarSelected ? "Unselect card" : "Select card"}
//                       className="rounded-sm"
//                     >
//                       <Star
//                         className={
//                           isStarSelected
//                             ? "size-3.5 fill-yellow-400 text-yellow-400"
//                             : isInactive
//                               ? "text-muted-foreground size-3.5"
//                               : "text-foreground size-3.5"
//                         }
//                       />
//                     </Button>
//                     <span>{card.title}</span>
//                   </div>
//                   <p className={isInactive ? "text-xs text-muted-foreground" : "text-xs"}>
//                     Status: <StatusText status={card.status} />
//                   </p>
//                   <p className={isInactive ? "text-muted-foreground mb-2 text-[11px]" : "text-muted-foreground mb-2 text-[11px]"}>
//                     {card.detail}
//                   </p>
//                   <div className="mt-auto flex items-center justify-between gap-2 pt-1">
//                     {isInactive ? (
//                       <>
//                         <Badge
//                           variant="ghost"
//                           className="rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground"
//                         >
//                           {card.skillMatch}
//                         </Badge>
//                         <Button
//                           variant="ghost"
//                           size="xs"
//                           className="hover:bg-transparent rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground"
//                           onClick={(event) => {
//                             event.stopPropagation();
//                             handleOpenNewAppliedDetail(card);
//                           }}
//                         >
//                           See Detail
//                         </Button>
//                       </>
//                     ) : (
//                       <>
//                         <Badge
//                           variant="ghost"
//                           className="rounded-full border border-primary/20"
//                           style={badgeGradientBackgroundStyle}
//                         >
//                           <span className="gradient-text">{card.skillMatch}</span>
//                         </Badge>
//                         <Button
//                           variant="ghost"
//                           size="xs"
//                           className="hover:bg-transparent rounded-full border bg-transparent"
//                           style={gradientBorderStyle}
//                           onClick={(event) => {
//                             event.stopPropagation();
//                             handleOpenNewAppliedDetail(card);
//                           }}
//                         >
//                           <span className="gradient-text">See Detail</span>
//                         </Button>
//                       </>
//                     )}
//                   </div>
//                 </>
//               );

//                 return (
//                   <article
//                     key={card.id}
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => handleOpenNewAppliedDetail(card)}
//                     onKeyDown={(event) => {
//                       if (event.key === "Enter" || event.key === " ") {
//                         event.preventDefault();
//                         handleOpenNewAppliedDetail(card);
//                       }
//                     }}
//                     className={card.highlighted ? "rounded-xl bg-card px-3 py-2.5 min-h-34.5 flex flex-col" : "rounded-xl border border-border bg-card px-3 py-2.5 min-h-34.5 flex flex-col"}
//                     style={
//                       card.highlighted
//                         ? gradientBorderStyle
//                         : undefined
//                     }
//                   >
//                     {cardContent}
//                   </article>
//                 );
//               })}
//             </div>
//           </section>
//         )}

//         {!isLatestJobOnlyMode && (
//           <SectionPagination
//             total={totalCards}
//             currentPage={currentPage}
//             onPageChange={setCurrentPage}
//             perPage={cardsPerPage}
//           />
//         )}

//         {!isNewAppliedOnlyMode && (
//           <section>
//             <h2 className="text-foreground mb-2 text-lg font-semibold">Latest Job activities</h2>
//             <div className="grid grid-cols-1 gap-3 lg:grid-cols-2 xl:grid-cols-3">
//               {pagedActivityCards.map((activity) => {
//               const isInactive = !activity.highlighted;
//               const starKey = `activity-${activity.id}`;
//               const isStarSelected = Boolean(selectedStars[starKey]);
//               const cardContent = (
//                 <>
//                   <div className="mb-1 flex items-center gap-1.5">
//                     <button
//                       type="button"
//                       onClick={(event) => {
//                         event.stopPropagation();
//                         toggleStar(starKey);
//                       }}
//                       aria-label={isStarSelected ? "Unselect card" : "Select card"}
//                       className="rounded-sm"
//                     >
//                       <Star
//                         className={
//                           isStarSelected
//                             ? "size-3.5 fill-yellow-400 text-yellow-400"
//                             : isInactive
//                               ? "text-muted-foreground size-3.5"
//                               : "text-foreground size-3.5"
//                         }
//                       />
//                     </button>
//                     <h3 className={isInactive ? "text-sm font-medium text-muted-foreground" : "text-sm font-medium"}>
//                       {activity.title}
//                     </h3>
//                   </div>
//                   <p className={isInactive ? "text-xs text-muted-foreground" : "text-xs"}>
//                     Status: <StatusText status={activity.status} />
//                   </p>
//                   <p className={isInactive ? "text-muted-foreground text-[11px]" : "text-muted-foreground text-[11px]"}>
//                     {activity.period}
//                   </p>
//                   <p className={isInactive ? "text-muted-foreground mb-2 text-[11px]" : "text-muted-foreground mb-2 text-[11px]"}>
//                     {activity.applied}
//                   </p>
//                   <div className="mt-auto flex items-center justify-between gap-2 pt-1">
//                     {activity.badgeText ? (
//                       isInactive ? (
//                         <Badge
//                           variant="ghost"
//                           className="rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground"
//                         >
//                           {activity.badgeText}
//                         </Badge>
//                       ) : (
//                         <Badge
//                           variant="ghost"
//                           className="rounded-full border border-primary/20"
//                           style={badgeGradientBackgroundStyle}
//                         >
//                           <span className="gradient-text">{activity.badgeText}</span>
//                         </Badge>
//                       )
//                     ) : (
//                       <span />
//                     )}
//                     {isInactive ? (
//                       <Button
//                         variant="ghost"
//                         size="xs"
//                         className="hover:bg-transparent rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground"
//                         onClick={(event) => {
//                           event.stopPropagation();
//                           handleSeeApplied(activity.title);
//                         }}
//                       >
//                         See Applied
//                       </Button>
//                     ) : (
//                       <Button
//                         variant="ghost"
//                         size="xs"
//                         className="hover:bg-transparent rounded-full border bg-transparent"
//                         style={gradientBorderStyle}
//                         onClick={(event) => {
//                           event.stopPropagation();
//                           handleSeeApplied(activity.title);
//                         }}
//                       >
//                         <span className="gradient-text">See Applied</span>
//                       </Button>
//                     )}
//                   </div>
//                 </>
//               );

//                 return (
//                   <article
//                     key={activity.id}
//                     role="button"
//                     tabIndex={0}
//                     onClick={() => handleSeeApplied(activity.title)}
//                     onKeyDown={(event) => {
//                       if (event.key === "Enter" || event.key === " ") {
//                         event.preventDefault();
//                         handleSeeApplied(activity.title);
//                       }
//                     }}
//                     className={activity.highlighted ? "rounded-xl bg-card px-3 py-2.5 min-h-34.5 flex flex-col" : "rounded-xl border border-border bg-card px-3 py-2.5 min-h-34.5 flex flex-col"}
//                     style={
//                       activity.highlighted
//                         ? gradientBorderStyle
//                         : undefined
//                     }
//                   >
//                     {cardContent}
//                   </article>
//                 );
//               })}
//             </div>

//             <SectionPagination
//               total={totalActivityCards}
//               currentPage={activityPage}
//               onPageChange={setActivityPage}
//               perPage={cardsPerPage}
//             />
//           </section>
//         )}

//         <ApplymonitorPopupPage
//           open={isDetailOpen}
//           onOpenChange={setIsDetailOpen}
//           card={selectedNewAppliedCard}
//         />
//         </div>
//       </div>
//     </PageLayout>
//   );
// }

// export default ApplymonitorPage;
