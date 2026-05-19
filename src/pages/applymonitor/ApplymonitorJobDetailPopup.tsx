import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { apiGetApplyMonitorJobDetail } from "@/services/applymonitorService";
import type { ApplyMonitorJobDetailResponse } from "@/types/applymonitorTypes";
import { formatDate } from "@/utils/formatDate";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { SkillRequest } from "@/types/createJobTypes";

export type ApplymonitorJobDetailPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string | undefined;
  jobTitle?: string;
};

export default function ApplymonitorJobDetailPopup({
  open,
  onOpenChange,
  jobId,
  jobTitle,
}: ApplymonitorJobDetailPopupProps) {
  const navigate = useNavigate();
  const [detail, setDetail] = useState<ApplyMonitorJobDetailResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const gradientBorderStyle = {
    border: "1px solid transparent",
    backgroundImage:
      "linear-gradient(var(--card), var(--card)), var(--gradient-primary)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  } as const;

  useEffect(() => {
    let isCancelled = false;
    if (!open || !jobId) return;

    const fetch = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        const res = await apiGetApplyMonitorJobDetail(jobId);
        if (isCancelled) return;
        setDetail(res.data);
      } catch {
        if (isCancelled) return;
        setDetail(null);
        setErrorMessage("Failed to load job detail");
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };
    void fetch();
    return () => {
      isCancelled = true;
    };
  }, [open, jobId]);

  const workOptionLabels =
    detail?.work_options
      ?.map((item) => item.work_option_ref?.text_eng)
      .filter((label): label is string => Boolean(label)) ?? [];

  const workTypeLabels =
    detail?.work_types
      ?.map((item) => item.work_type_ref?.text_eng)
      .filter((label): label is string => Boolean(label)) ?? [];

  const skillLabels = detail?.skills?.map((item) => item.skill_name) ?? [];

  const locationLabel = useMemo(() => {
    if (!detail) return "-";
    const parts = [
      detail.sub_district?.sub_district_name_en,
      detail.district?.district_name_en,
      detail.province?.province_name_en,
      detail.postal_code_ref?.postal_code,
    ].filter(
      (item): item is string | number => item !== null && item !== undefined,
    );
    return parts.length > 0 ? parts.join(", ") : "-";
  }, [detail]);

  const applyPeriod =
    detail?.start_apply && detail?.end_apply
      ? `${formatDate({ date: detail.start_apply, format: "DD/MM/YYYY" })} - ${formatDate({ date: detail.end_apply, format: "DD/MM/YYYY" })}`
      : "-";

  const detailTitle = detail?.name ?? jobTitle ?? "-";
  const detailStatus = detail?.status_name ?? "";
  const aboutDescription =
    detail?.description_rtf || detail?.description || "-";

  const handleEdit = () => {
    if (!detail) return;
    const prefillSkills: SkillRequest[] = (detail.skills ?? []).map((s, i) => ({
      index: i,
      skill_id: s.skill_id,
      skill_name: s.skill_name,
    }));

    navigate("/createjob", {
      state: {
        prefill: {
          jobId: detail.id,
          name: detail.name,
          description: detail.description ?? "",
          description_rtf: detail.description_rtf ?? "",
          start_apply: detail.start_apply ?? null,
          end_apply: detail.end_apply ?? null,
          cover_letter: detail.cover_letter,
          work_experience: detail.work_experience,
          education: detail.education,
          work_option_id: detail.work_options?.[0]?.work_option_id ?? null,
          work_type_id: detail.work_types?.[0]?.work_type_id ?? null,
          skills: prefillSkills,
          address_line: detail.address_line ?? "",
          no: detail.no ?? "",
          moo: detail.moo ?? "",
          soi: detail.soi ?? "",
          street: detail.street ?? "",
          sub_district_code: detail.sub_district?.sub_district_code ?? 0,
          district_code: detail.district?.district_code ?? 0,
          province_code: detail.province?.province_code ?? 0,
          country_code: detail.country?.country_code ?? 0,
          postal_code: detail.postal_code_ref?.postal_code ?? 0,
          province_name: detail.province?.province_name_en ?? "",
          district_name: detail.district?.district_name_en ?? "",
          sub_district_name: detail.sub_district?.sub_district_name_en ?? "",
        },
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[85vw]! max-w-245! gap-0! overflow-hidden rounded-2xl p-0! sm:max-w-245!">
        <div className="flex h-[78vh] min-h-0 flex-col">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 z-30 rounded-full border border-border bg-background/95 p-1 text-foreground hover:bg-muted"
          >
            <X className="size-6" />
          </button>

          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
            <div className="sticky top-0 z-10 bg-background pb-3">
              <h2 className="pr-10 text-3xl font-medium leading-tight text-foreground">
                {detailTitle}
              </h2>
              <p className="text-sm text-muted-foreground">{locationLabel}</p>
              <p className="text-sm text-muted-foreground">{applyPeriod}</p>
              {detailStatus ? (
                <p className="text-sm text-muted-foreground">
                  Status: <span className="text-primary">{detailStatus}</span>
                </p>
              ) : null}
            </div>

            {(workOptionLabels.length > 0 || workTypeLabels.length > 0) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {workOptionLabels.map((label) => (
                  <Badge
                    key={label}
                    variant="outline"
                    className="rounded-full border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
                  >
                    {label}
                  </Badge>
                ))}
                {workTypeLabels.map((label) => (
                  <Badge
                    key={label}
                    variant="outline"
                    className="rounded-full border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
                  >
                    {label}
                  </Badge>
                ))}
              </div>
            )}

            <section className="mt-4">
              <h3 className="text-lg font-semibold text-foreground">
                Skill Use
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {skillLabels.length > 0 ? (
                  skillLabels.map((skill) => (
                    <Badge
                      key={skill}
                      variant="outline"
                      className="rounded-full bg-transparent px-3 py-1 text-xs"
                      style={gradientBorderStyle}
                    >
                      <span className="gradient-text">{skill}</span>
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">-</p>
                )}
              </div>
            </section>

            <section className="mt-4">
              <h3 className="text-lg font-semibold text-foreground">
                About this job
              </h3>
              {isLoading ? (
                <p className="mt-2 text-base text-muted-foreground">
                  Loading...
                </p>
              ) : errorMessage ? (
                <p className="mt-2 text-base text-destructive">
                  {errorMessage}
                </p>
              ) : detail?.description_rtf ? (
                <div
                  className="mt-2 prose prose-sm max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: aboutDescription }}
                />
              ) : (
                <p className="mt-2 text-base text-foreground">
                  {aboutDescription}
                </p>
              )}

              <p className="mt-3 text-base font-medium text-foreground">
                Location:
              </p>
              <p className="mt-1 text-base text-foreground">{locationLabel}</p>
            </section>
          </div>

          <div className="border-t border-border bg-background px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-muted-foreground/30 bg-muted text-muted-foreground"
                disabled
              >
                Unpublished
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-muted-foreground/30 bg-transparent text-muted-foreground"
                onClick={handleEdit}
                disabled={isLoading || !detail}
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full bg-transparent"
                style={gradientBorderStyle}
                onClick={() => onOpenChange(false)}
              >
                <span className="gradient-text">See Apply</span>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
