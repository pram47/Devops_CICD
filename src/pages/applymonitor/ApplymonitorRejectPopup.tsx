import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import type { ApplymonitorRejectPopupProps } from "@/types/domain/apply-monitor";
import { X } from "lucide-react";

export default function ApplymonitorRejectPopup({
  open,
  onOpenChange,
}: ApplymonitorRejectPopupProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[90vw]! max-w-130! sm:max-w-130! rounded-2xl p-0! overflow-hidden">
        <div className="relative p-6">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full p-1 text-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>

          <div className="space-y-5 pt-6 text-center">
            <h3 className="text-4xl font-medium">Reject This Application</h3>
            <p className="text-muted-foreground">~~~~~~~~~~</p>

            <div className="flex items-center justify-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="rounded-full border border-muted-foreground/30 bg-transparent text-muted-foreground"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                variant="default"
                size="sm"
                className="rounded-full"
                onClick={() => onOpenChange(false)}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
