export interface GetScoutListParams {
  search?: string;
  job_name?: string | number;
  page?: number;
  limit?: number;
}

export interface ScoutListItem {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  logo: string | null;
  user_name: string;
  match_skill: number;
  is_star: boolean;
}

export interface GetScoutListResponse {
  data: ScoutListItem[];
  page: number;
  limit: number;
  total: number;
}
