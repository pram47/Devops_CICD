import type { ReactNode } from "react";

export type ApplicationCard = {
  id: number;
  applyId: string;
  create_date: string;
  title: string;
  status: string;
  detail: string;
  skillMatch: string;
  isStar?: boolean;
  highlighted?: boolean;
};

export type ActivityCard = {
  id: number;
  create_date: string;
  title: string;
  status: string;
  period: string;
  applied: string;
  badgeText: string;
  highlighted?: boolean;
  jobId?: string;
};

export type ApplymonitorPopupPageProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: ApplicationCard | null;
  onRefetch?: () => void;
};

export type ApplymonitorRejectPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export type ApplymonitorSkillPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillName: string;
};

export type ApplymonitorFilterPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};
