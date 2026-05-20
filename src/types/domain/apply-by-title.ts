import type { ReactNode } from "react";

export type CandidateCard = {
  id: number;
  name: string;
  status: "Apply" | "Interview" | "Accept" | "Reject";
  section: "newApplied" | "applied" | "interview" | "accept" | "reject";
  appliedAt: string;
  badgeText?: string;
  skillMatch: string;
  viewed?: boolean;
  highlightVariant?: "gradient" | "pink" | "green";
};

export type CandidateSection = CandidateCard["section"];

export type SectionConfig = {
  section: CandidateSection;
  count: number;
  status: CandidateCard["status"];
  highlightVariant?: CandidateCard["highlightVariant"];
};

export type ApplyStatusFilter =
  | "all"
  | "apply"
  | "interview"
  | "accept"
  | "reject";

export type ApplyByTitleCardVariant =
  | "newApplied"
  | "applied"
  | "interview"
  | "accept"
  | "reject";

export type ApplyByTitleCandidateCardProps = {
  card: CandidateCard;
  variant: ApplyByTitleCardVariant;
  isStarSelected: boolean;
  onToggleStar: (cardId: number) => void;
  onOpenDetail: (card: CandidateCard) => void;
};

export type ApplyByTitleFilterPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
};

export type FilterFieldKey =
  | "userSkill"
  | "experience"
  | "achievement"
  | "project"
  | "yearExperience";

export type FilterFieldValues = Record<FilterFieldKey, string>;

export type ApplyByTitleJobDetailPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobTitle: string;
};

export type ApplyByTitleNewAppliedPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: CandidateCard | null;
};

export type ApplyByTitleSkillPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillName: string;
};
