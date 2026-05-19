import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileAboutPopupProps } from "@/types/domain/profile";
import { X } from "lucide-react";

const ABOUT_CHARACTER_LIMIT = 1024;
const DEFAULT_CHARACTERS_PER_LINE = 64;

function normalizeNewlines(value: string) {
  return value.replace(/\r\n?/g, "\n");
}

function getLineBreakCost(lineLength: number, charactersPerLine: number) {
  if (charactersPerLine <= 0) {
    return 0;
  }

  if (lineLength === 0) {
    return charactersPerLine;
  }

  const remainder = lineLength % charactersPerLine;
  return remainder === 0 ? 0 : charactersPerLine - remainder;
}

function computeWeightedLength(value: string, charactersPerLine: number) {
  const normalizedValue = normalizeNewlines(value);
  let total = 0;
  let currentLineLength = 0;

  for (const character of normalizedValue) {
    if (character === "\n") {
      total += getLineBreakCost(currentLineLength, charactersPerLine);
      currentLineLength = 0;
      continue;
    }

    total += 1;
    currentLineLength += 1;
  }

  return total;
}

function trimValueToLimit(
  value: string,
  charactersPerLine: number,
  limit: number,
) {
  const normalizedValue = normalizeNewlines(value);
  let acceptedValue = "";
  let total = 0;
  let currentLineLength = 0;

  for (const character of normalizedValue) {
    const nextCost =
      character === "\n"
        ? getLineBreakCost(currentLineLength, charactersPerLine)
        : 1;

    if (total + nextCost > limit) {
      break;
    }

    acceptedValue += character;
    total += nextCost;

    if (character === "\n") {
      currentLineLength = 0;
      continue;
    }

    currentLineLength += 1;
  }

  return acceptedValue;
}

function measureCharactersPerLine(textarea: HTMLTextAreaElement) {
  const computedStyle = window.getComputedStyle(textarea);
  const sampleText =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789".repeat(3);
  const measurementNode = document.createElement("span");

  measurementNode.textContent = sampleText;
  measurementNode.style.position = "absolute";
  measurementNode.style.visibility = "hidden";
  measurementNode.style.whiteSpace = "pre";
  measurementNode.style.font = computedStyle.font;
  measurementNode.style.fontKerning = computedStyle.fontKerning;
  measurementNode.style.fontStretch = computedStyle.fontStretch;
  measurementNode.style.fontVariant = computedStyle.fontVariant;
  measurementNode.style.letterSpacing = computedStyle.letterSpacing;
  document.body.appendChild(measurementNode);

  const paddingLeft = Number.parseFloat(computedStyle.paddingLeft) || 0;
  const paddingRight = Number.parseFloat(computedStyle.paddingRight) || 0;
  const availableWidth = Math.max(
    textarea.clientWidth - paddingLeft - paddingRight,
    1,
  );
  const averageCharacterWidth =
    measurementNode.getBoundingClientRect().width / sampleText.length;

  document.body.removeChild(measurementNode);

  if (!Number.isFinite(averageCharacterWidth) || averageCharacterWidth <= 0) {
    return DEFAULT_CHARACTERS_PER_LINE;
  }

  return Math.max(1, Math.floor(availableWidth / averageCharacterWidth));
}

export default function ProfileAboutPopup({
  open,
  value,
  onOpenChange,
  onSave,
}: ProfileAboutPopupProps) {
  const [draftValue, setDraftValue] = useState(value);
  const [charactersPerLine, setCharactersPerLine] = useState(
    DEFAULT_CHARACTERS_PER_LINE,
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const weightedLength = computeWeightedLength(draftValue, charactersPerLine);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDraftValue(value);
    }
  }, [open, value]);

  useEffect(() => {
    const textarea = textareaRef.current;

    if (!open || !textarea) {
      return;
    }

    const updateCharactersPerLine = () => {
      setCharactersPerLine(measureCharactersPerLine(textarea));
    };

    updateCharactersPerLine();

    const resizeObserver = new ResizeObserver(() => {
      updateCharactersPerLine();
    });

    resizeObserver.observe(textarea);
    window.addEventListener("resize", updateCharactersPerLine);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateCharactersPerLine);
    };
  }, [open]);

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
              About Me
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Make changes to your About here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <div className="rounded-xl border border-border p-3 shadow-none">
              <Textarea
                ref={textareaRef}
                value={draftValue}
                onChange={(event) => {
                  setDraftValue(
                    trimValueToLimit(
                      event.target.value,
                      charactersPerLine,
                      ABOUT_CHARACTER_LIMIT,
                    ),
                  );
                }}
                placeholder="Type your message here"
                className="h-28 min-h-28 resize-none overflow-y-auto border-0 px-0 py-0 text-sm leading-6 shadow-none outline-none field-sizing-fixed whitespace-pre-wrap wrap-break-word focus-visible:ring-0"
              />
              <div className="mt-2 text-right text-xs text-muted-foreground">
                {weightedLength}/{ABOUT_CHARACTER_LIMIT}
              </div>
            </div>
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
