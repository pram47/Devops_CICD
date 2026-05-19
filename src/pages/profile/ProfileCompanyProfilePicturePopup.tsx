import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProfileCompanyProfilePicturePopupProps } from "@/types/domain/profile";
import { ImagePlus, X } from "lucide-react";

export default function ProfileCompanyProfilePicturePopup({
  open,
  value,
  companyName,
  onOpenChange,
  onSave,
}: ProfileCompanyProfilePicturePopupProps) {
  const [draftImageUrl, setDraftImageUrl] = useState(value);
  const [draftFile, setDraftFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftImageUrl(value);
      setDraftFile(null);
      setErrorMessage("");
    }
  }, [open, value]);

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      return;
    }

    if (!selectedFile.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      event.target.value = "";
      return;
    }

    setDraftFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setDraftImageUrl(result);
        setErrorMessage("");
      }
    };
    reader.readAsDataURL(selectedFile);
    event.target.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[92vw]! max-w-130! gap-0 rounded-[22px] p-0! sm:max-w-130!">
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
              Company Profile Picture
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Upload a clear square image for your company profile.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 rounded-xl border border-border bg-background p-4">
            <div className="mx-auto size-40 overflow-hidden rounded-full border-4 border-card bg-[#c8ccd2] shadow-sm">
              {draftImageUrl ? (
                <img
                  src={draftImageUrl}
                  alt={companyName}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelected}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="size-4" />
                Upload Image
              </Button>
            </div>

            <p className="mt-3 text-center text-xs text-muted-foreground">
              Recommended: square image, at least 512 x 512 px
            </p>
            {errorMessage ? (
              <p className="mt-1 text-center text-xs text-destructive">
                {errorMessage}
              </p>
            ) : null}
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
              onClick={() => onSave(draftImageUrl, draftFile ?? undefined)}
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
