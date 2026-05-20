import apiService from "./apiService";
import type {
  CreateJobRequest,
  CreateJobResponse,
  GetJobDetailResponse,
  PatchJobStatusRequest,
  UtilityOptionTypeResponse,
  SkillSearchResultItem,
  SkillDetailResponse,
} from "@/types/createJobTypes";

// post {{employer-bff}}/job/:company_id     create job
export const apiCreateJob = (companyId: string, data: CreateJobRequest) => {
  return apiService.fetchData<CreateJobResponse>({
    url: `/job/${companyId}`,
    method: "post",
    data,
  });
};

// get {{employer-bff}}/job/:job_id     get job detail
export const apiGetJobById = (jobId: string) => {
  return apiService.fetchData<GetJobDetailResponse>({
    url: `/job/${jobId}`,
    method: "get",
  });
};

// patch {{employer-bff}}/job/:job_id     update job
export const apiPatchJobById = (jobId: string, data: CreateJobRequest) => {
  return apiService.fetchData<CreateJobResponse>({
    url: `/job/${jobId}`,
    method: "patch",
    data,
  });
};

// patch {{employer-bff}}/job/:job_id/status     update job status
export const apiPatchJobStatusById = (
  jobId: string,
  data: PatchJobStatusRequest,
) => {
  return apiService.fetchData<GetJobDetailResponse>({
    url: `/job/${jobId}/status`,
    method: "patch",
    data,
  });
};

// get {{employer-bff}}/utility/option-type     work option & work type master data
export const apiGetUtilityOptionType = () => {
  return apiService.fetchData<UtilityOptionTypeResponse>({
    url: `/utility/option-type`,
    method: "get",
  });
};

// get {{employer-bff}}/utility/skills/search/:searchName     search skills
export const apiSearchSkills = (searchName: string) => {
  return apiService.fetchData<SkillSearchResultItem[]>({
    url: `/utility/skills/search/${encodeURIComponent(searchName)}`,
    method: "get",
  });
};

// get {{employer-bff}}/utility/skills/:id     skill detail
export const apiGetSkillDetailById = (skillId: string) => {
  return apiService.fetchData<SkillDetailResponse>({
    url: `/utility/skills/${encodeURIComponent(skillId)}`,
    method: "get",
  });
};
