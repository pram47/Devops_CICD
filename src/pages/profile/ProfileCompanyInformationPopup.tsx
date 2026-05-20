import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RtfQuill from "@/components/ui/rtf-quill";
import type { ProfileCompanyInformationPopupProps } from "@/types/domain/profile";
import { X } from "lucide-react";

export default function ProfileCompanyInformationPopup({
  open,
  value,
  onOpenChange,
  onSave,
}: ProfileCompanyInformationPopupProps) {
  const [draftValue, setDraftValue] = useState(value);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftValue(value);
    }
  }, [open, value]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw]! max-h-[90vh]! max-w-240! gap-0 overflow-hidden rounded-[22px] p-0! sm:max-w-240!">
        <div className="relative p-4 sm:p-5">
          <button
            type="button"
            aria-label="Close"
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-full p-1 text-foreground hover:bg-muted"
          >
            <X className="size-5" />
          </button>

          <DialogHeader className="gap-1 pr-10">
            <DialogTitle className="pt-0 text-[16px] font-semibold text-foreground">
              Company Infomation
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              ~~~~~~~~~~
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 h-105 rounded-xl border border-border bg-background overflow-hidden">
            <RtfQuill
              value={draftValue}
              onChange={setDraftValue}
              className="flex h-full flex-col [&_.ql-container.ql-snow]:basis-0 [&_.ql-container.ql-snow]:grow [&_.ql-container.ql-snow]:overflow-hidden [&_.ql-container.ql-snow]:border-0 [&_.ql-editor]:h-full [&_.ql-editor]:overflow-y-auto [&_.ql-editor]:px-4 [&_.ql-editor]:py-3 [&_.ql-editor]:text-sm [&_.ql-editor]:leading-6 [&_.ql-toolbar.ql-snow]:shrink-0 [&_.ql-toolbar.ql-snow]:border-x-0 [&_.ql-toolbar.ql-snow]:border-t-0 [&_.ql-toolbar.ql-snow]:border-b [&_.ql-toolbar.ql-snow]:px-2 [&_.ql-toolbar.ql-snow]:py-2"
            />
          </div>

          <div className="mt-4 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="min-w-20"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => onSave(draftValue)}
              className="min-w-28"
            >
              Save Change
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
