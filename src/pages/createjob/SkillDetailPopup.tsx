import { Dialog, DialogContent } from "@/components/ui/dialog";
import { X } from "lucide-react";
import type { SkillDetailPopupProps } from "@/types/createJobTypes";

export default function SkillDetailPopup({
  open,
  onOpenChange,
  skillName,
  category,
  description,
  preSkills,
}: SkillDetailPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw]! max-w-130! rounded-2xl p-0! overflow-hidden gap-0!">
        <div className="relative p-5 sm:p-6 max-h-[80vh] overflow-y-auto">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full p-1 text-foreground hover:bg-muted z-10"
          >
            <X className="h-5 w-5" />
          </button>

          <div className="space-y-4">
            <div className="pr-8">
              <h3 className="text-[34px] leading-none font-medium gradient-text">
                {skillName}
              </h3>
            </div>

            <div>
              <p className="text-lg font-medium">Category</p>
              <p className="text-muted-foreground text-base">{category}</p>
            </div>

            <div>
              <p className="mb-2 text-lg font-medium">Pre-Skill</p>
              <div className="flex flex-wrap gap-2">
                {preSkills.map((preSkill, index) => (
                  <span
                    key={index}
                    className={`rounded-full border px-4 py-1 text-sm ${
                      preSkill === skillName
                        ? "border-primary/40 text-primary"
                        : "border-muted-foreground/30 bg-muted text-muted-foreground"
                    }`}
                  >
                    {preSkill}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 text-lg font-medium">Skill Description</p>
              <div className="space-y-2 text-base font-normal leading-relaxed text-foreground">
                {description.split("\n\n").map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
