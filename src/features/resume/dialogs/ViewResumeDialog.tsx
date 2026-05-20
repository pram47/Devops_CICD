import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import RenderResume from "@/features/resume/RenderResume";
import type { ResumeCreateProps, ResumeListItem } from "@/types/resumeType";
import dayjs from "dayjs";
import { RiPencilFill } from "react-icons/ri";
import { HiOutlineDocumentDownload } from "react-icons/hi";
import { DialogClose } from "@/components/ui/dialog";
import { CgClose } from "react-icons/cg";

const formatMonthYear = (value?: Date | string) => {
  if (!value) return "";
  const d = dayjs(typeof value === "string" ? new Date(value) : value);
  return d.isValid() ? d.format("MMM YYYY") : "";
};

const formatResumeDate = (date: string) => {
  const d = dayjs(date);
  return d.isValid() ? d.format("DD MMM YYYY HH:mm") : date;
};

type ViewResumeDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeData: ResumeCreateProps | null;
  resumeItem: ResumeListItem | null;
  templateId?: number;
  onEdit?: (id: string) => void;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export function ViewResumeDialog({
  open,
  onOpenChange,
  resumeData,
  resumeItem,
  templateId = 1,
  onEdit,
  onDownload,
  onDelete,
}: ViewResumeDialogProps) {
  const displayDate = resumeItem
    ? formatResumeDate(resumeItem.create_date)
    : "";
  const title = resumeItem?.name || `Resume ${displayDate}`;
  const resume = resumeData ?? null;

  if (!resume) return null;

  const d = resume.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[calc(100%-2rem)] sm:max-w-5xl w-full overflow-hidden flex flex-col p-0 gap-0"
        showCloseButton={false}
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <DialogTitle className="text-xl font-medium">{title}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Create At: {displayDate}
              </p>
            </div>
            <DialogClose asChild>
              <Button variant="ghost" size="icon" aria-label="Close">
                <CgClose className="size-4" />
              </Button>
            </DialogClose>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0 overflow-hidden px-6 gap-4">
          {/* Left: Tabs + read-only content */}
          <div className="flex flex-col min-w-0 min-h-0 w-[55%] rounded-xl bg-white overflow-hidden">
            <Tabs
              defaultValue="basic"
              className="flex flex-col flex-1 min-h-0 overflow-hidden"
            >
              <div className="rounded-xl border border-neutral-200 bg-white p-[3px] shrink-0">
                <TabsList className="w-full justify-start h-9 rounded-xl bg-neutral-50">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="education">Education</TabsTrigger>
                  <TabsTrigger value="experience">Experience</TabsTrigger>
                  <TabsTrigger value="other">Other</TabsTrigger>
                </TabsList>
              </div>
              <div className="flex-1 min-h-0 p-3 border border-neutral-200 rounded-xl">
                <TabsContent
                  value="basic"
                  className="space-y-6 mt-0 max-h-[calc(80vh-14rem)] overflow-y-auto"
                >
                  <section>
                    <div className="text-base font-medium">Personal Info</div>
                    <div className="mt-3 space-y-3">
                      <div className="space-y-1.5">
                        <span className="text-sm text-muted-foreground">
                          Tel.
                        </span>
                        <p className="text-sm">{d.phone || "—"}</p>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-sm text-muted-foreground">
                          Email
                        </span>
                        <p className="text-sm break-all">{d.email || "—"}</p>
                      </div>
                    </div>
                  </section>
                  <section>
                    <div className="text-base font-medium">Address</div>
                    <div className="mt-3 space-y-1.5">
                      <p className="text-sm">
                        {d.address?.address_line ||
                          [
                            d.address?.no,
                            d.address?.moo,
                            d.address?.soi,
                            d.address?.street,
                            d.address?.sub_district,
                            d.address?.district,
                            d.address?.province,
                            d.address?.country,
                          ]
                            .filter(Boolean)
                            .join(", ") ||
                          "—"}
                      </p>
                    </div>
                  </section>
                  <section>
                    <div className="mt-3 space-y-3">
                      {d.contact?.length ? (
                        d.contact.map((c, i) => (
                          <div key={i} className="space-y-1">
                            <p className="text-sm font-medium">
                              {c.label || "—"}
                            </p>
                            <a
                              href={c.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium break-all hover:underline"
                            >
                              {c.link || "—"}
                            </a>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">—</p>
                      )}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent
                  value="education"
                  className="space-y-6 mt-0 max-h-[calc(80vh-14rem)] overflow-y-auto"
                >
                  <section>
                    <div className="text-base font-medium">Skills</div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {d.skills?.length
                        ? d.skills.map((s) => (
                            <Button variant="outline" key={s.id}>
                              {s.name}
                            </Button>
                          ))
                        : "—"}
                    </div>
                  </section>
                  <section>
                    <div className="text-base font-medium">Education</div>
                    <div className="mt-3 space-y-3">
                      {d.education?.length
                        ? d.education.map((edu, i) => (
                            <div
                              key={i}
                              className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4"
                            >
                              <div className="size-10 shrink-0 rounded-full bg-neutral-200" />
                              <div className="min-w-0 flex-1 space-y-0.5">
                                <p className="font-medium text-neutral-900">
                                  {edu.school_name || "School Name"}
                                </p>
                                <p className="text-sm text-neutral-600">
                                  {[edu.degree, edu.field_of_study]
                                    .filter(Boolean)
                                    .join(", ") ||
                                    "Associate's degree, Computer Science"}
                                </p>
                                <p className="text-sm text-neutral-500">
                                  {formatMonthYear(edu.start_date)} -{" "}
                                  {formatMonthYear(edu.end_date) || "—"}
                                </p>
                              </div>
                            </div>
                          ))
                        : "—"}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent
                  value="experience"
                  className="space-y-6 mt-0 max-h-[calc(80vh-14rem)] overflow-y-auto"
                >
                  <section>
                    <div className="text-base font-medium">Work Experience</div>
                    <div className="mt-3 space-y-3">
                      {d.work_experience?.length
                        ? d.work_experience.map((exp, i) => (
                            <div
                              key={i}
                              className="rounded-2xl border border-neutral-200 bg-white p-4"
                            >
                              <p className="font-medium text-neutral-900">
                                {exp.position || "Position"}
                              </p>
                              <p className="text-sm text-neutral-600">
                                {exp.company_name || "Company"}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {formatMonthYear(exp.start_date)} -{" "}
                                {formatMonthYear(exp.end_Date) || "—"}
                              </p>
                            </div>
                          ))
                        : "—"}
                    </div>
                  </section>
                  <section>
                    <div className="text-base font-medium">Project</div>
                    <div className="mt-3 space-y-3">
                      {d.projects?.length
                        ? d.projects.map((proj, i) => (
                            <div
                              key={i}
                              className="rounded-2xl border border-neutral-200 bg-white p-4"
                            >
                              <p className="font-medium text-neutral-900">
                                {proj.name || "Project Name"}
                              </p>
                              <p className="text-sm text-neutral-600 line-clamp-2">
                                {proj.description || "—"}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {formatMonthYear(proj.start_date)} -{" "}
                                {formatMonthYear(proj.end_date) || "—"}
                              </p>
                            </div>
                          ))
                        : "—"}
                    </div>
                  </section>
                  <section>
                    <div className="text-base font-medium">Achievement</div>
                    <div className="mt-3 space-y-3">
                      {d.achievement?.length
                        ? d.achievement.map((item, i) => (
                            <div
                              key={i}
                              className="rounded-2xl border border-neutral-200 bg-white p-4"
                            >
                              <p className="font-medium text-neutral-900">
                                {item.name || "Achievement Name"}
                              </p>
                              <p className="text-sm text-neutral-600">
                                {item.project_name || "—"}
                              </p>
                              <p className="text-sm text-neutral-500">
                                {formatMonthYear(item.date) || "—"}
                              </p>
                            </div>
                          ))
                        : "—"}
                    </div>
                  </section>
                </TabsContent>

                <TabsContent
                  value="other"
                  className="space-y-6 mt-0 max-h-[calc(80vh-14rem)] overflow-y-auto"
                >
                  <section>
                    <div className="text-base font-medium">Miscellaneous</div>
                    <div className="mt-3 space-y-4">
                      {d.miscellaneous?.length
                        ? d.miscellaneous.map((item, i) => (
                            <div
                              key={i}
                              className="rounded-xl border border-neutral-200 p-4"
                            >
                              <p className="text-sm font-medium">
                                {item.label || `Item #${i + 1}`}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                {item.data || "—"}
                              </p>
                            </div>
                          ))
                        : "—"}
                    </div>
                  </section>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Right: Rendered resume — fixed height, scrolls inside */}
          <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
            <div className="min-h-0 flex-1 overflow-auto">
              <RenderResume resume={resume} templateId={templateId} />
            </div>
          </div>
        </div>

        <DialogFooter className="pb-6 px-6 pt-2 flex-row justify-between shrink-0">
          <div className="flex-1">
            {onDelete && resumeItem && (
              <Button
                variant="outline"
                onClick={() => {
                  onDelete(resumeItem.id);
                  onOpenChange(false);
                }}
              >
                Delete Resume
              </Button>
            )}
          </div>
          <div className="flex gap-4">
            {onDownload && resumeItem && (
              <Button
                variant="outline"
                onClick={() => onDownload(resumeItem.id)}
              >
                <HiOutlineDocumentDownload className="size-4" />
                Download
              </Button>
            )}
            {onEdit && resumeItem && (
              <Button
                variant="outline"
                onClick={() => {
                  onEdit(resumeItem.id);
                  onOpenChange(false);
                }}
              >
                <RiPencilFill className="size-4" />
                Edit
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
