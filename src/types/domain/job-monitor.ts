export type JobMonitorCard = {
  id: number;
  jobId: string;
  title: string;
  status: string;
  jobStatus: "open" | "closed";
  period: string;
  applied: string;
  companyName: string;
  locationPosted: string;
};

export type JobMonitorDetailPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  card: JobMonitorCard | null;
};
