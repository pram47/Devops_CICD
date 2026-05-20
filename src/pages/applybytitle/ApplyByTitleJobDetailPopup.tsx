import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ApplyByTitleJobDetailPopupProps } from "@/types/domain/apply-by-title";
import { X } from "lucide-react";

export default function ApplyByTitleJobDetailPopup({
  open,
  onOpenChange,
  jobTitle,
}: ApplyByTitleJobDetailPopupProps) {
  const gradientBorderStyle = {
    border: "1px solid transparent",
    backgroundImage:
      "linear-gradient(var(--card), var(--card)), var(--gradient-primary)",
    backgroundOrigin: "border-box",
    backgroundClip: "padding-box, border-box",
  } as const;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[85vw]! max-w-245! gap-0! overflow-hidden rounded-2xl p-0! sm:max-w-245!">
        <div className="flex h-[78vh] min-h-0 flex-col">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-3 rounded-full p-1 text-foreground hover:bg-muted"
          >
            <X className="size-6" />
          </button>

          <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto px-4 py-3 sm:px-5">
            <h2 className="pr-10 text-3xl font-medium leading-tight text-foreground">
              {jobTitle}
            </h2>
            <p className="text-muted-foreground">Select Service Partner Ltd.</p>
            <p className="text-sm text-muted-foreground">
              Chon Buri, Thailand · posted 1 week ago
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              <Badge
                variant="outline"
                className="rounded-full border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                On-site
              </Badge>
              <Badge
                variant="outline"
                className="rounded-full border-border bg-muted px-3 py-1 text-xs text-muted-foreground"
              >
                Internship
              </Badge>
            </div>

            <section className="mt-4">
              <h3 className="text-lg font-semibold text-foreground">
                Skill Use
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {["React", "TypeScript", "Figma"].map((skill) => (
                  <Badge
                    key={skill}
                    variant="outline"
                    className="rounded-full bg-transparent px-3 py-1 text-xs"
                    style={gradientBorderStyle}
                  >
                    <span className="gradient-text">{skill}</span>
                  </Badge>
                ))}
              </div>
            </section>

            <section className="mt-4">
              <h3 className="text-lg font-semibold text-foreground">
                About this job
              </h3>

              <p className="mt-2 text-base text-foreground">
                At Western Digital, our vision is to power global innovation and
                push the boundaries of technology to make what you thought was
                once impossible, possible.
              </p>

              <p className="mt-3 text-base text-foreground">
                At our core, Western Digital is a company of problem solvers.
                People achieve extraordinary things given the right technology.
                For decades, we&apos;ve been doing just that—our technology
                helped people put a man on the moon and capture the first-ever
                picture of a black hole.
              </p>

              <p className="mt-3 text-base text-foreground">
                We offer an expansive portfolio of technologies, HDDs, and
                platforms for business, creative professionals, and consumers
                alike under our Western Digital®, WD®, WD_BLACK™, and SanDisk®
                Professional brands.
              </p>

              <p className="mt-3 text-base text-foreground">
                We are a key partner to some of the largest and highest-growth
                organizations in the world. From enabling systems to make cities
                safer and more connected, to powering the data centers behind
                many of the world&apos;s biggest companies and hyperscale cloud
                providers, to meeting the massive and ever-growing data storage
                needs of the AI era, Western Digital is fueling a brighter,
                smarter future.
              </p>

              <p className="mt-3 text-base text-foreground">
                Today&apos;s exceptional challenges require your unique skills.
                Together, we can build the future of data storage.
              </p>

              <p className="mt-3 text-base font-medium text-foreground">
                Location:
              </p>
            </section>
          </div>

          <div className="border-t border-border bg-background px-4 py-3 sm:px-5">
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-muted-foreground/30 bg-muted text-muted-foreground"
              >
                Unpublished
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full border-muted-foreground/30 bg-transparent text-muted-foreground"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="rounded-full bg-transparent"
                style={gradientBorderStyle}
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
