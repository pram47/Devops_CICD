export type ScoutCandidate = {
  id: string;
  name: string;
  matchJob: string;
  description: string;
  skillMatch: string;
  isStar: boolean;
};

export type ScoutCandidateCardProps = {
  candidate: ScoutCandidate;
  isStarSelected: boolean;
  onToggleStar: (candidateId: string) => void;
};
