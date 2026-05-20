import { cn } from "@/lib/utils";
import type { ToggleProps } from "@/types/ui";

export default function Toggle({ checked, onChange, className }: ToggleProps) {
  return (
    <label className={cn("relative inline-block h-5 w-9", className)}>
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="absolute inset-0 rounded-full bg-gray-200 transition peer-checked:bg-[linear-gradient(to_right,var(--gradient-start),var(--gradient-end))]" />
      <span className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
    </label>
  );
}
