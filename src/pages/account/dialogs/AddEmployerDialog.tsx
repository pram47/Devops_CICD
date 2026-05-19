import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiPostAssignUser } from "@/services/accountManagementService";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ROLE_OPTIONS = [
  { label: "jobby_user", value: 1 },
  { label: "employer_admin", value: 2 },
  { label: "manager", value: 3 },
  { label: "hr", value: 4 },
  { label: "staff", value: 5 },
];

interface AddEmployerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  onSuccess?: () => void;
}

export default function AddEmployerDialog({
  open,
  onOpenChange,
  companyId,
  onSuccess,
}: AddEmployerDialogProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = (value: boolean) => {
    if (!isSubmitting) {
      setEmail("");
      setRole(null);
      onOpenChange(value);
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || role === null) return;

    setIsSubmitting(true);
    try {
      await apiPostAssignUser({
        company_id: companyId,
        email: email.trim(),
        role,
      });
      toast.success("Employer added successfully");
      handleClose(false);
      onSuccess?.();
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status && status >= 400 && status < 500) {
        toast.error("Failed to add employer. Please check the details.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Employer</DialogTitle>
          <DialogDescription>enter employer credential</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employer-email">Email</Label>
            <Input
              id="employer-email"
              placeholder="Enter email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="employer-role">Role</Label>
            <Select
              value={role !== null ? String(role) : ""}
              onValueChange={(val) => setRole(Number(val))}
              disabled={isSubmitting}
            >
              <SelectTrigger id="employer-role" className="w-full">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={String(opt.value)}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSubmit}
            disabled={!email.trim() || role === null || isSubmitting}
            className="bg-linear-to-r from-orange-400 to-pink-500 text-white hover:from-orange-500 hover:to-pink-600 border-0"
          >
            <Plus className="size-4" />
            Add Employer
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
