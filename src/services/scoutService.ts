import apiService from "./apiService";
import type {
  GetScoutListParams,
  GetScoutListResponse,
} from "@/types/scoutTypes";

export type {
  GetScoutListParams,
  GetScoutListResponse,
  ScoutListItem,
} from "@/types/scoutTypes";

// get {{employer-bff}}/scout?search&job_name=1&page=0&limit=10     scout
export const apiGetScoutList = (params: GetScoutListParams = {}) => {
  const { search, job_name, page = 0, limit = 10 } = params;

  return apiService.fetchData<GetScoutListResponse>({
    url: "/scout",
    method: "get",
    params: {
      ...(search !== undefined ? { search } : {}),
      ...(job_name !== undefined ? { job_name } : {}),
      page,
      limit,
    },
  });
};
