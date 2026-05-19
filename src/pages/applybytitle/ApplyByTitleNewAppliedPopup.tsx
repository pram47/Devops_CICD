import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ApplyByTitleNewAppliedPopupProps } from "@/types/domain/apply-by-title";
import { Star, X } from "lucide-react";
import { useEffect, useState } from "react";
import ApplymonitorSkillPopup from "@/pages/applymonitor/ApplymonitorSkillPopup";
import ApplymonitorRejectPopup from "@/pages/applymonitor/ApplymonitorRejectPopup";

export default function ApplyByTitleNewAppliedPopup({
  open,
  onOpenChange,
  card,
}: ApplyByTitleNewAppliedPopupProps) {
  const [isSkillPopupOpen, setIsSkillPopupOpen] = useState(false);
  const [isRejectPopupOpen, setIsRejectPopupOpen] = useState(false);
  const [selectedSkillName, setSelectedSkillName] = useState("React");
  const [activeSkillIndex, setActiveSkillIndex] = useState<number | null>(null);
  const [isStarSelected, setIsStarSelected] = useState(false);

  const openSkillPopup = (skillName: string) => {
    setSelectedSkillName(skillName);
    setIsSkillPopupOpen(true);
  };

  const handleSkillPopupOpenChange = (nextOpen: boolean) => {
    setIsSkillPopupOpen(nextOpen);

    if (!nextOpen) {
      setActiveSkillIndex(null);
    }
  };

  useEffect(() => {
    if (!open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsSkillPopupOpen(false);
      setIsRejectPopupOpen(false);
      setActiveSkillIndex(null);
      setIsStarSelected(false);
    }
  }, [open]);

  if (!card) {
    return null;
  }

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
            <div className="space-y-4 pb-6">
              <div>
                <div className="flex items-center gap-2 text-xl font-medium">
                  <h2>{card.name}</h2>
                  <button
                    type="button"
                    aria-label={
                      isStarSelected ? "Unstar candidate" : "Star candidate"
                    }
                    onClick={() => setIsStarSelected((previous) => !previous)}
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
                  Status: <span className="text-amber-500">{card.status}</span>
                </p>
              </div>

              <div className="grid grid-cols-[120px_1fr] gap-x-3 text-base font-medium">
                <p>email</p>
                <p>kunguy.159@gmail.com</p>
                <p>mobile phone</p>
                <p>(+66) 62-4311671</p>
                <p>github</p>
                <p>https://github.com/</p>
                <p>linkedin</p>
                <p>https://www.linkedin.com/feed/</p>
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
                  Candidate matched profile for this job opening.
                </p>
                <p className="text-muted-foreground text-sm font-normal">
                  {card.appliedAt}
                </p>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">User Skill</h3>
                <div className="flex flex-wrap gap-2">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveSkillIndex(index);
                        openSkillPopup("React");
                      }}
                      className={
                        activeSkillIndex === index
                          ? "border-primary/40 bg-muted text-primary"
                          : "border-primary/40 text-primary hover:bg-muted hover:text-primary"
                      }
                    >
                      React
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">
                  How much impact does it have on our company?
                </h3>
                <div className="h-48 rounded-2xl border-2 border-dashed border-secondary/60 bg-background" />
              </div>

              <div>
                <h3 className="mb-2 text-lg font-medium">Application Answer</h3>
                <p className="text-base font-normal">
                  Question 1 : Lorem ipsum dolor sit amet, consectetur
                  adipiscing elit. Nunc sit amet ultrices est.
                </p>
                <p className="text-muted-foreground text-sm font-normal">
                  Answer : Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit.
                </p>
                <p className="mt-2 text-base font-normal">
                  Question 1 : Lorem ipsum dolor sit amet, consectetur
                  adipiscing elit. Nunc sit amet ultrices est.
                </p>
                <p className="text-muted-foreground text-sm font-normal">
                  Answer : Lorem ipsum dolor sit amet, consectetur adipiscing
                  elit.
                </p>
              </div>
            </div>
          </div>

          <div className="flex h-full min-h-0 flex-col border-l bg-background p-6 pl-4 pt-14">
            <div className="mb-3 flex shrink-0 items-center justify-between">
              <h3 className="text-2xl font-medium">Resume</h3>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-muted-foreground/30 bg-transparent"
              >
                download
              </Button>
            </div>

            <div className="no-scrollbar min-h-0 flex-1 overflow-y-scroll overscroll-contain pb-4 pr-1">
              <div className="w-full aspect-210/297 rounded-2xl bg-destructive/80" />
            </div>

            <div className="mt-2 flex shrink-0 flex-wrap justify-end gap-2 bg-background pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground"
                onClick={() => setIsRejectPopupOpen(true)}
              >
                Reject
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-primary/30 bg-transparent text-primary"
              >
                Move To Interview
              </Button>
              <Button variant="default" size="sm" className="rounded-full">
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
