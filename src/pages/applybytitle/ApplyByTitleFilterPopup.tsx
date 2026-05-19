import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type {
  ApplyByTitleFilterPopupProps,
  FilterFieldKey,
  FilterFieldValues,
} from "@/types/domain/apply-by-title";
import { useEffect, useState } from "react";

const initialFieldValues: FilterFieldValues = {
  userSkill: "1",
  experience: "1",
  achievement: "1",
  project: "1",
  yearExperience: "1",
};

function FilterCountField({
  label,
  unit,
  value,
  onChange,
}: {
  label: string;
  unit: "Skills" | "Year";
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="mb-1 text-base font-medium leading-none text-foreground">
        {label}
      </p>
      <div className="flex items-center gap-2">
        <span className="text-sm font-normal text-muted-foreground">
          More than
        </span>
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onBlur={() => onChange(value)}
          className="h-8 w-14 px-2 text-sm"
        />
        <span className="text-sm font-normal text-muted-foreground">
          {unit}
        </span>
      </div>
    </div>
  );
}

export default function ApplyByTitleFilterPopup({
  open,
  onOpenChange,
  children,
}: ApplyByTitleFilterPopupProps) {
  const [fieldValues, setFieldValues] =
    useState<FilterFieldValues>(initialFieldValues);
  const [isAppliedStarredOnly, setIsAppliedStarredOnly] = useState(false);

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFieldValues(initialFieldValues);
      setIsAppliedStarredOnly(false);
    }
  }, [open]);

  const updateFieldValue = (field: FilterFieldKey, value: string) => {
    const digitsOnlyValue = value.replace(/\D/g, "");
    const normalizedValue =
      digitsOnlyValue.length === 0
        ? "0"
        : String(Number.parseInt(digitsOnlyValue, 10));

    setFieldValues((prev) => ({
      ...prev,
      [field]: normalizedValue,
    }));
  };

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>{children}</PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={10}
        className="w-100 rounded-2xl border border-border p-4 shadow-md"
      >
        <div className="space-y-3">
          <div>
            <p className="text-xl font-medium text-foreground">Filter</p>
            <p className="mt-1 text-sm font-normal text-muted-foreground">
              Add match Skill in each category
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            <FilterCountField
              label="User Skill"
              unit="Skills"
              value={fieldValues.userSkill}
              onChange={(value) => updateFieldValue("userSkill", value)}
            />
            <FilterCountField
              label="Experience"
              unit="Skills"
              value={fieldValues.experience}
              onChange={(value) => updateFieldValue("experience", value)}
            />
            <FilterCountField
              label="Achievement"
              unit="Skills"
              value={fieldValues.achievement}
              onChange={(value) => updateFieldValue("achievement", value)}
            />
            <FilterCountField
              label="Project"
              unit="Skills"
              value={fieldValues.project}
              onChange={(value) => updateFieldValue("project", value)}
            />
            <FilterCountField
              label="Year experience"
              unit="Year"
              value={fieldValues.yearExperience}
              onChange={(value) => updateFieldValue("yearExperience", value)}
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id="applied-starred-only"
              checked={isAppliedStarredOnly}
              onCheckedChange={(checked) =>
                setIsAppliedStarredOnly(checked === true)
              }
            />
            <label
              htmlFor="applied-starred-only"
              className="text-base font-medium text-foreground"
            >
              Show only Applied starred.
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
