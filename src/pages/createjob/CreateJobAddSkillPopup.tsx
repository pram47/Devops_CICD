import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Loader2 } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import {
  apiGetSkillDetailById,
  apiSearchSkills,
} from "@/services/createjobService";
import type {
  CreateJobAddSkillPopupProps,
  SkillDetailResponse,
  SkillSearchResultItem,
  SkillRequest,
} from "@/types/createJobTypes";

export default function CreateJobAddSkillPopup({
  open,
  onOpenChange,
  onSubmit,
}: CreateJobAddSkillPopupProps) {
  const [searchValue, setSearchValue] = useState("");
  const [results, setResults] = useState<SkillSearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSkill, setSelectedSkill] =
    useState<SkillSearchResultItem | null>(null);
  const [detailSkill, setDetailSkill] = useState<SkillDetailResponse | null>(
    null,
  );
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = searchValue.trim();
    if (!trimmed) {
      setResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await apiSearchSkills(trimmed);
        setResults(res.data ?? []);
      } catch {
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchValue]);

  const handleClose = () => {
    setSearchValue("");
    setResults([]);
    setSelectedSkill(null);
    setDetailSkill(null);
    setIsLoadingDetail(false);
    onOpenChange(false);
  };

  const getSkillDisplayName = (skill: SkillSearchResultItem) =>
    skill.skill_name ?? skill.name ?? "";

  const getSearchSkillId = (skill: SkillSearchResultItem) =>
    skill.skill_id ?? skill.eid ?? skill.skillElementId ?? skill.id ?? "";

  const getDetailSkillName = () =>
    detailSkill?.name ??
    (selectedSkill ? getSkillDisplayName(selectedSkill) : "");

  const getSelectedSkillId = (skill: SkillSearchResultItem | null) => {
    if (!skill) return "";
    return getSearchSkillId(skill);
  };

  const handleShowSkillDetail = async () => {
    const skillId = getSelectedSkillId(selectedSkill);
    if (!skillId) return;
    try {
      setIsLoadingDetail(true);
      const response = await apiGetSkillDetailById(skillId);
      setDetailSkill(response.data ?? null);
    } catch {
      setDetailSkill({
        skillElementId: skillId,
        name: selectedSkill ? getSkillDisplayName(selectedSkill) : "",
        description: "",
        pre_skills: [],
      });
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleAddSkillToForm = () => {
    if (!selectedSkill) return;
    const skillReq: SkillRequest = {
      index: 0,
      skill_id: getSearchSkillId(selectedSkill),
      skill_name: getSkillDisplayName(selectedSkill),
    };
    onSubmit(skillReq);
    handleClose();
  };

  // Reset when closed
  useEffect(() => {
    if (!open) {
      setSearchValue("");
      setResults([]);
      setSelectedSkill(null);
      setDetailSkill(null);
      setIsLoadingDetail(false);
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[90vw]! max-w-130! rounded-2xl p-0! overflow-hidden gap-0!">
        <div className="relative p-5 sm:p-6">
          <button
            type="button"
            aria-label="Close"
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-full p-1 text-foreground hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-4">
            <div className="pr-8">
              <h3 className="text-[34px] leading-none font-medium gradient-text">
                Add Skill
              </h3>
              <p className="mt-2 text-xs tracking-[0.2em] text-muted-foreground">
                ~~~~~~
              </p>
            </div>

            <div>
              <label className="mb-1 block text-base font-medium">
                Search Skill
              </label>
              <Input
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  setSelectedSkill(null);
                }}
                placeholder="React..."
                autoFocus
              />
            </div>

            {isSearching && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}

            {!isSearching && searchValue.trim() && results.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Suggestions:</p>
                <div className="flex max-h-40 flex-wrap gap-2 overflow-y-auto pr-1">
                  {results.map((skill, index) => (
                    <button
                      key={`${getSearchSkillId(skill)}-${index}`}
                      type="button"
                      onClick={() => setSelectedSkill(skill)}
                      className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                        selectedSkill &&
                        getSearchSkillId(selectedSkill) ===
                          getSearchSkillId(skill)
                          ? "bg-primary/10 border-primary text-primary"
                          : "border-primary/40 text-primary hover:bg-primary/5"
                      }`}
                    >
                      {getSkillDisplayName(skill)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {!isSearching && searchValue.trim() && results.length === 0 && (
              <p className="text-sm text-muted-foreground">No skills found</p>
            )}

            {selectedSkill && !detailSkill && (
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  onClick={handleShowSkillDetail}
                  disabled={isLoadingDetail}
                  className="w-full text-white"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {isLoadingDetail ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>+ Add "{getSkillDisplayName(selectedSkill)}"</>
                  )}
                </Button>
              </div>
            )}

            {detailSkill && (
              <div className="space-y-3 rounded-md border border-border p-3">
                <div>
                  <p className="mb-1 text-base font-medium">
                    Skill Description
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {detailSkill.description?.trim() || "-"}
                  </p>
                </div>

                <div>
                  <p className="mb-2 text-base font-medium">Pre-Skill</p>
                  {((detailSkill.pre_skills ?? detailSkill.preSkills ?? [])
                    .length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {(
                        detailSkill.pre_skills ??
                        detailSkill.preSkills ??
                        []
                      ).map((preSkill, index) => (
                        <span
                          key={`${preSkill}-${index}`}
                          className="rounded-full border border-muted-foreground/30 bg-muted px-3 py-1 text-sm text-muted-foreground"
                        >
                          {preSkill}
                        </span>
                      ))}
                    </div>
                  )) || <p className="text-sm text-muted-foreground">-</p>}
                </div>

                <div className="flex gap-2 pt-1">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDetailSkill(null)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button
                    type="button"
                    onClick={handleAddSkillToForm}
                    className="flex-1 text-white"
                    style={{ background: "var(--gradient-primary)" }}
                  >
                    + Add "{getDetailSkillName()}"
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
