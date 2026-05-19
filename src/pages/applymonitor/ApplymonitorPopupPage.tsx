import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import RenderResume from "@/features/resume/RenderResume";
import ApplymonitorRejectPopup from "@/pages/applymonitor/ApplymonitorRejectPopup";
import ApplymonitorSkillPopup from "@/pages/applymonitor/ApplymonitorSkillPopup";
import type { ApplyMonitorApplyDetailResponse } from "@/services/applymonitorService";
import {
  apiGetApplyMonitorApplyDetail,
  apiPatchApplyMonitorApplyStatus,
} from "@/services/applymonitorService";
import { apiResumeExport } from "@/services/utilityService";
import type { ApplyMonitorApplyDetailResume } from "@/types/applymonitorTypes";
import type { ApplymonitorPopupPageProps } from "@/types/domain/apply-monitor";
import type { ResumeCreateProps } from "@/types/resumeType";
import { formatDate } from "@/utils/formatDate";
import { Star, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
};

const mapApplyDetailResumeToResumeCreate = (
  resume: ApplyMonitorApplyDetailResume,
): ResumeCreateProps => ({
  id: resume.id,
  name: resume.name,
  create_date: resume.create_date,
  theme: resume.theme,
  color: resume.color,
  resume_file: resume.resume_file ?? "",
  resume_file_metadata: resume.resume_file_metadata ?? null,
  data: {
    first_name: resume.first_name,
    last_name: resume.last_name,
    logo: resume.logo ?? "",
    phone: resume.phone ?? "",
    phone_region: resume.phone_region ?? "",
    email: resume.email ?? "",
    contact: (resume.contacts ?? []).map((contact) => ({
      label: contact.label,
      link: contact.link,
    })),
    skills: (resume.skills ?? []).map((skill) => ({
      id: skill.id,
      name: skill.skill_name,
    })),
    address: {
      address_line: resume.address_line ?? "",
      no: resume.no ?? "",
      moo: resume.moo ?? "",
      soi: resume.soi ?? "",
      street: resume.street ?? "",
      sub_district: resume.sub_district?.sub_district_name_en ?? "",
      district: resume.district?.district_name_en ?? "",
      province: resume.province?.province_name_en ?? "",
      country: resume.country?.country_name_en ?? "",
      sub_district_id: resume.sub_district_id,
      sub_district_th: resume.sub_district?.sub_district_name_th ?? "",
      sub_district_eng: resume.sub_district?.sub_district_name_en ?? "",
      district_id: resume.district_id,
      district_th: resume.district?.district_name_th ?? "",
      district_eng: resume.district?.district_name_en ?? "",
      province_id: resume.province_id,
      province_th: resume.province?.province_name_th ?? "",
      province_eng: resume.province?.province_name_en ?? "",
      country_id: resume.country_id,
      country_th: resume.country?.country_name_th ?? "",
      country_eng: resume.country?.country_name_en ?? "",
      postal_code: resume.postal_code ?? undefined,
    },
    education: (resume.educations ?? []).map((education) => ({
      school_name: education.school_name,
      logo: education.logo,
      degree: education.degree,
      field_of_study: education.field_of_study,
      start_date: education.start_date,
      end_date: education.end_date ?? "",
      gpax: Number(education.gpax) || 0,
    })),
    work_experience: (resume.work_experiences ?? []).map((experience) => ({
      id: experience.id,
      position: experience.position,
      logo: experience.logo,
      company_name: experience.company_name,
      start_date: experience.start_date,
      end_Date: experience.end_date ?? "",
      skills: [],
      work_type: experience.work_type,
      work_type_id: experience.work_type_id,
    })),
    projects: (resume.projects ?? []).map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date ?? "",
      skills: [],
      images: [],
    })),
    achievement: (resume.achievements ?? []).map((achievement) => ({
      id: achievement.id,
      name: achievement.name,
      project_name: achievement.project_name,
      description: achievement.description,
      date: achievement.date,
      skills: [],
      images: [],
    })),
    miscellaneous: [],
  },
});

export default function ApplymonitorPopupPage({
  open,
  onOpenChange,
  card,
  onRefetch,
}: ApplymonitorPopupPageProps) {
  const navigate = useNavigate();
  const [isSkillPopupOpen, setIsSkillPopupOpen] = useState(false);
  const [isRejectPopupOpen, setIsRejectPopupOpen] = useState(false);
  const [selectedSkillName, setSelectedSkillName] = useState("React");
  const [activeSkillIndex, setActiveSkillIndex] = useState<number | null>(null);
  const [isStarSelected, setIsStarSelected] = useState(false);
  const [detail, setDetail] = useState<ApplyMonitorApplyDetailResponse | null>(
    null,
  );
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const openSkillPopup = (skillName: string) => {
    setSelectedSkillName(skillName);
    setIsSkillPopupOpen(true);
  };

  const handleSkillPopupOpenChange = (nextOpen: boolean) => {
    setIsSkillPopupOpen(nextOpen);
    if (!nextOpen) setActiveSkillIndex(null);
  };

  const handleMoveToInterview = async () => {
    if (!detail?.id) return;
    setActionLoading(true);
    try {
      await apiPatchApplyMonitorApplyStatus(detail.id, { status: 2 });
      onRefetch?.();
      onOpenChange(false);
    } catch {
      // error handling can be added here
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!detail?.id) return;
    setActionLoading(true);
    try {
      await apiPatchApplyMonitorApplyStatus(detail.id, { status: 3 });
      onRefetch?.();
      onOpenChange(false);
    } catch {
      // error handling can be added here
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadResume = useCallback(async (resumeId: string) => {
    const toastId = toast.loading("Downloading resume...");
    try {
      const result = await apiResumeExport(resumeId);
      downloadBlob(result.blob, result.filename);
      toast.success("Resume downloaded", { id: toastId });
    } catch {
      toast.error("Failed to export resume", { id: toastId });
    }
  }, []);

  useEffect(() => {
    if (!open) {
      setIsSkillPopupOpen(false);
      setIsRejectPopupOpen(false);
      setActiveSkillIndex(null);
      setIsStarSelected(false);
      setDetail(null);
      return;
    }

    if (!card?.applyId) return;

    let cancelled = false;
    const fetch = async () => {
      setDetailLoading(true);
      try {
        const res = await apiGetApplyMonitorApplyDetail(card.applyId);
        if (cancelled) return;
        setDetail(res.data);
        setIsStarSelected(res.data.is_star);
      } catch {
        // leave detail null
      } finally {
        if (!cancelled) setDetailLoading(false);
      }
    };
    void fetch();
    return () => {
      cancelled = true;
    };
  }, [open, card?.applyId]);

  if (!card) return null;

  const resume = detail?.resume_detail;
  const user = resume?.user ?? detail?.user;
  const skills = resume?.skills ?? [];
  const email = user?.email ?? "";
  const phone = user?.phone
    ? `(${user.phone_region ?? "+66"}) ${user.phone}`
    : "";
  const contacts = resume?.contacts ?? [];
  const github =
    contacts.find((c) => c.label.toLowerCase().includes("github"))?.link ?? "";
  const linkedin =
    contacts.find((c) => c.label.toLowerCase().includes("linkedin"))?.link ??
    "";
  const statusLabel = detail?.status_name?.en ?? card.status;
  const currentStatus = detail?.status;
  const isAlreadyRejected = currentStatus === 3;
  const isAlreadyInterview = currentStatus === 2;
  const appliedDate = detail?.created_at
    ? formatDate({ date: detail.created_at, format: "DD/MM/YYYY HH:mm" })
    : "";
  const mappedResume = detail?.resume_detail
    ? mapApplyDetailResumeToResumeCreate(detail.resume_detail)
    : null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="h-[90vh]! w-[90vw]! max-w-[90vw]! sm:max-w-[90vw]! gap-0! p-0! overflow-hidden rounded-2xl [&>div]:h-full [&>div]:gap-0 [&>div>div]:h-full [&>div>div]:min-h-0 [&>div>div]:justify-start">
        <div className="relative grid h-full min-h-0 grid-cols-1 md:grid-cols-[1fr_1.1fr]">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 z-10 rounded-full p-1 text-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>

          <div className="no-scrollbar h-full min-h-0 overflow-y-scroll overscroll-contain p-6 pr-4">
            {detailLoading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : (
              <div className="space-y-4 pb-6">
                <div>
                  <div className="flex items-center gap-2 text-xl font-medium">
                    <h2>{detail?.user_name ?? card.title}</h2>
                    <button
                      type="button"
                      aria-label={
                        isStarSelected ? "Unstar candidate" : "Star candidate"
                      }
                      onClick={() => setIsStarSelected((p) => !p)}
                      className="rounded-sm"
                    >
                      <Star
                        className={
                          isStarSelected
                            ? "size-5 fill-yellow-400 text-yellow-400"
                            : "size-5 text-foreground"
                        }
                      />
                    </button>
                  </div>
                  <p className="text-lg font-normal">
                    Status:{" "}
                    <span className="text-amber-500">{statusLabel}</span>
                  </p>
                </div>

                <div className="grid grid-cols-[120px_1fr] gap-x-3 text-base font-medium">
                  {email && (
                    <>
                      <p>email</p>
                      <p className="break-all">{email}</p>
                    </>
                  )}
                  {phone && (
                    <>
                      <p>mobile phone</p>
                      <p>{phone}</p>
                    </>
                  )}
                  {github && (
                    <>
                      <p>github</p>
                      <p className="break-all">{github}</p>
                    </>
                  )}
                  {linkedin && (
                    <>
                      <p>linkedin</p>
                      <p className="break-all">{linkedin}</p>
                    </>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-full border border-muted-foreground/30 bg-transparent text-base font-medium text-muted-foreground"
                >
                  View Profile
                </Button>

                <div>
                  <h3 className="text-lg font-medium">Job Application</h3>
                  <p className="text-base font-normal">
                    Applied In: {detail?.job_name ?? card.detail}
                  </p>
                  {appliedDate && (
                    <p className="text-muted-foreground text-sm font-normal">
                      Applied: {appliedDate}
                    </p>
                  )}
                </div>

                {skills.length > 0 && (
                  <div>
                    <h3 className="mb-2 text-lg font-medium">User Skill</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, index) => (
                        <Button
                          key={skill.id}
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setActiveSkillIndex(index);
                            openSkillPopup(skill.skill_name);
                          }}
                          className={
                            activeSkillIndex === index
                              ? "border-primary/40 bg-muted text-primary"
                              : "border-primary/40 text-primary hover:bg-muted hover:text-primary"
                          }
                        >
                          {skill.skill_name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex h-full min-h-0 flex-col border-l bg-background p-6 pl-4 pt-14">
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <h3 className="text-2xl font-medium">Resume</h3>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-muted-foreground/30 bg-transparent"
                onClick={() => handleDownloadResume(resume?.id ?? "")}
                disabled={!resume?.id}
              >
                download
              </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border border-neutral-200 bg-neutral-50">
              <div className="min-h-0 flex-1 overflow-auto">
                {mappedResume && (
                  <RenderResume
                    resume={mappedResume}
                    templateId={mappedResume.theme}
                  />
                )}
              </div>
            </div>

            <div className="mt-2 flex shrink-0 flex-wrap justify-end gap-2 bg-background pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground"
                onClick={handleReject}
                disabled={actionLoading || isAlreadyRejected}
              >
                Reject
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-primary/30 bg-transparent text-primary"
                onClick={handleMoveToInterview}
                disabled={actionLoading || isAlreadyInterview}
              >
                Move To Interview
              </Button>
              <Button
                onClick={() => {
                  const otherId = user?.id ?? detail?.user?.id ?? "";
                  if (!otherId) return;
                  onOpenChange(false);
                  navigate(
                    `/message?otherUserId=${encodeURIComponent(otherId)}`,
                  );
                }}
              >
                Message
              </Button>
            </div>
          </div>
        </div>

        <ApplymonitorSkillPopup
          open={isSkillPopupOpen}
          onOpenChange={handleSkillPopupOpenChange}
          skillName={selectedSkillName}
        />

        <ApplymonitorRejectPopup
          open={isRejectPopupOpen}
          onOpenChange={setIsRejectPopupOpen}
        />
      </DialogContent>
    </Dialog>
  );
}
