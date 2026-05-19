import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ApplymonitorSkillPopupProps } from "@/types/domain/apply-monitor";
import { X } from "lucide-react";

export default function ApplymonitorSkillPopup({
  open,
  onOpenChange,
  skillName,
}: ApplymonitorSkillPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw]! max-w-190! sm:max-w-190! rounded-2xl p-0! overflow-hidden">
        <div className="relative p-6">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full p-1 text-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>

          <div className="space-y-3">
            <h3 className="text-4xl font-medium gradient-text">{skillName}</h3>

            <div>
              <p className="text-lg font-medium">Category</p>
              <p className="text-muted-foreground text-base">
                Computer, Tecnology
              </p>
            </div>

            <div>
              <p className="mb-2 text-lg font-medium">Pre-Skill</p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-primary/40 px-4 py-1 text-primary">
                  TypeScript
                </span>
                <span className="rounded-full border border-muted-foreground/30 bg-muted px-4 py-1 text-muted-foreground">
                  Figma
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-lg font-medium">Skill Description</p>
              <p className="text-base font-normal leading-relaxed">
                At Western Digital, our vision is to power global innovation and
                push the boundaries of technology to make what you thought was
                once impossible, possible.
              </p>
              <p className="mt-4 text-base font-normal leading-relaxed">
                At our core, Western Digital is a company of problem solvers.
                People achieve extraordinary things given the right technology.
                For decades, we've been doing just that—our technology helped
                people put a man on the moon and capture the first-ever picture
                of a black hole.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
