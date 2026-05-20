import apiService from "./apiService";
import type {
  ApplyMonitorApplyDetailResponse,
  ApplyMonitorJobDetailResponse,
  ApplyMonitorJobAppliesParams,
  ApplyMonitorJobAppliesResponse,
  ApplyMonitorOptionJobSkillsParams,
  ApplyMonitorOptionJobSkillsResponse,
  ApplyMonitorOptionsResponse,
  ApplyMonitorSearchApplyParams,
  ApplyMonitorSearchApplyResponse,
  ApplyMonitorSearchJobParams,
  ApplyMonitorSearchJobResponse,
  ApplyMonitorStarApplyRequest,
  ApplyMonitorStarApplyResponse,
  ApplyMonitorUpdateApplyStatusRequest,
  ApplyMonitorUpdateApplyStatusResponse,
  ApplyMonitorUpdateApplyViewedRequest,
  ApplyMonitorUpdateApplyViewedResponse,
  GetJobMonitorJobsParams,
  GetJobMonitorJobsResponse,
} from "@/types/applymonitorTypes";

export type {
  ApplyMonitorApplyDetailJob,
  ApplyMonitorApplyDetailResponse,
  ApplyMonitorApplyDetailResume,
  ApplyMonitorApplyDetailUser,
  ApplyMonitorJobDetailCategoryItem,
  ApplyMonitorJobDetailPostalCodeRef,
  ApplyMonitorJobDetailResponse,
  ApplyMonitorJobDetailSkillItem,
  ApplyMonitorJobDetailWorkOptionItem,
  ApplyMonitorJobDetailWorkTypeItem,
  ApplyMonitorJobApplyItem,
  ApplyMonitorJobAppliesParams,
  ApplyMonitorJobAppliesResponse,
  ApplyMonitorOptionJobSkillsParams,
  ApplyMonitorOptionJobSkillsResponse,
  ApplyMonitorOptionSkillItem,
  ApplyMonitorOptionItem,
  ApplyMonitorOptionsResponse,
  ApplyMonitorSearchApplyItem,
  ApplyMonitorSearchApplyParams,
  ApplyMonitorSearchApplyResponse,
  ApplyMonitorSearchJobItem,
  ApplyMonitorSearchJobParams,
  ApplyMonitorSearchJobResponse,
  ApplyMonitorStarApplyRequest,
  ApplyMonitorStarApplyResponse,
  ApplyMonitorUpdateApplyStatusRequest,
  ApplyMonitorUpdateApplyStatusResponse,
  ApplyMonitorUpdateApplyViewedRequest,
  ApplyMonitorUpdateApplyViewedResponse,
  GetJobMonitorJobsParams,
  JobMonitorJobItem,
  GetJobMonitorJobsResponse,
} from "@/types/applymonitorTypes";

// get {{employer-bff}}/job-monitor/job?search&job_status_id=1&sort_by_id=3&page=0&limit=10     job monitor
export const apiGetJobMonitorJobs = (params: GetJobMonitorJobsParams = {}) => {
  const { search, job_status_id, sort_by_id, page = 0, limit = 10 } = params;

  return apiService.fetchData<GetJobMonitorJobsResponse>({
    url: "/job-monitor/job",
    method: "get",
    params: {
      ...(search !== undefined ? { search } : {}),
      ...(job_status_id !== undefined ? { job_status_id } : {}),
      ...(sort_by_id !== undefined ? { sort_by_id } : {}),
      page,
      limit,
    },
  });
};

// get {{employer-bff}}/apply-monitor/search/job?page=0&limit=10     search job
export const apiApplyMonitorSearchJob = (
  params: ApplyMonitorSearchJobParams = {},
) => {
  const { search, sortById, jobStatusIds, page = 0, limit = 10 } = params;

  return apiService.fetchData<ApplyMonitorSearchJobResponse>({
    url: "/apply-monitor/search/job",
    method: "get",
    params: {
      ...(search !== undefined ? { search } : {}),
      ...(sortById !== undefined ? { sortById } : {}),
      ...(jobStatusIds && jobStatusIds.length > 0
        ? { jobStatusIds: jobStatusIds.join(",") }
        : {}),
      page,
      limit,
    },
  });
};

// get {{employer-bff}}/apply-monitor/search/apply?sortById=1&page=0&limit=10     search apply
export const apiApplyMonitorSearchApply = (
  params: ApplyMonitorSearchApplyParams = {},
) => {
  const {
    search,
    applyStatusId,
    jobStatus,
    workType,
    jobName,
    skillIds,
    sortById,
    page = 0,
    limit = 10,
  } = params;

  return apiService.fetchData<ApplyMonitorSearchApplyResponse>({
    url: "/apply-monitor/search/apply",
    method: "get",
    params: {
      ...(search !== undefined ? { search } : {}),
      ...(applyStatusId !== undefined ? { applyStatusId } : {}),
      ...(jobStatus && jobStatus.length > 0 ? { jobStatus } : {}),
      ...(workType && workType.length > 0 ? { workType } : {}),
      ...(jobName !== undefined ? { jobName } : {}),
      ...(skillIds && skillIds.length > 0 ? { skillIds } : {}),
      ...(sortById !== undefined ? { sortById } : {}),
      page,
      limit,
    },
  });
};

// get {{employer-bff}}/apply-monitor/options     option apply-monitor
export const apiGetApplyMonitorOptions = () => {
  return apiService.fetchData<ApplyMonitorOptionsResponse>({
    url: "/apply-monitor/options",
    method: "get",
  });
};

// get {{employer-bff}}/apply-monitor/options/job/skills?searchName=test     search skill
export const apiGetApplyMonitorOptionJobSkills = (
  params: ApplyMonitorOptionJobSkillsParams = {},
) => {
  const { searchName } = params;

  return apiService.fetchData<ApplyMonitorOptionJobSkillsResponse>({
    url: "/apply-monitor/options/job/skills",
    method: "get",
    params: {
      ...(searchName !== undefined ? { searchName } : {}),
    },
  });
};

// get {{employer-bff}}/apply-monitor/job/:job_id/applies?applyStatusId=1&search&skillIds&userSkillMoreThan&experienceMoreThan&achievementMoreThan&projectMoreThan&yearExperienceMoreThan&starredOnly=&sortById=3&page=0&limit=10     apply all
export const apiGetApplyMonitorJobApplies = (
  jobId: string,
  params: ApplyMonitorJobAppliesParams = {},
) => {
  const {
    applyStatusId,
    search,
    skillIds,
    userSkillMoreThan,
    experienceMoreThan,
    achievementMoreThan,
    projectMoreThan,
    yearExperienceMoreThan,
    starredOnly,
    sortById,
    page = 0,
    limit = 10,
  } = params;

  return apiService.fetchData<ApplyMonitorJobAppliesResponse>({
    url: `/apply-monitor/job/${jobId}/applies`,
    method: "get",
    params: {
      ...(applyStatusId !== undefined ? { applyStatusId } : {}),
      ...(search !== undefined ? { search } : {}),
      ...(skillIds !== undefined ? { skillIds } : {}),
      ...(userSkillMoreThan !== undefined ? { userSkillMoreThan } : {}),
      ...(experienceMoreThan !== undefined ? { experienceMoreThan } : {}),
      ...(achievementMoreThan !== undefined ? { achievementMoreThan } : {}),
      ...(projectMoreThan !== undefined ? { projectMoreThan } : {}),
      ...(yearExperienceMoreThan !== undefined
        ? { yearExperienceMoreThan }
        : {}),
      ...(starredOnly !== undefined ? { starredOnly } : {}),
      ...(sortById !== undefined ? { sortById } : {}),
      page,
      limit,
    },
  });
};

// get {{employer-bff}}/apply-monitor/apply/:id     Apply detail
export const apiGetApplyMonitorApplyDetail = (id: string) => {
  return apiService.fetchData<ApplyMonitorApplyDetailResponse>({
    url: `/apply-monitor/apply/${id}`,
    method: "get",
  });
};

// get {{employer-bff}}/apply-monitor/job/:job_id/detail     job detail
export const apiGetApplyMonitorJobDetail = (jobId: string) => {
  return apiService.fetchData<ApplyMonitorJobDetailResponse>({
    url: `/apply-monitor/job/${jobId}/detail`,
    method: "get",
  });
};

// patch {{employer-bff}}/apply-monitor/apply/:apply_id/star     star apply
export const apiPatchApplyMonitorApplyStar = (
  applyId: string,
  data: ApplyMonitorStarApplyRequest,
) => {
  return apiService.fetchData<ApplyMonitorStarApplyResponse>({
    url: `/apply-monitor/apply/${applyId}/star`,
    method: "patch",
    data,
  });
};

// patch {{employer-bff}}/apply-monitor/apply/:apply_id/status     update apply status
export const apiPatchApplyMonitorApplyStatus = (
  applyId: string,
  data: ApplyMonitorUpdateApplyStatusRequest,
) => {
  return apiService.fetchData<ApplyMonitorUpdateApplyStatusResponse>({
    url: `/apply-monitor/apply/${applyId}/status`,
    method: "patch",
    data,
  });
};

// patch {{employer-bff}}/apply-monitor/apply/:apply_id/viewed     update apply viewed
export const apiPatchApplyMonitorApplyViewed = (
  applyId: string,
  data: ApplyMonitorUpdateApplyViewedRequest,
) => {
  return apiService.fetchData<ApplyMonitorUpdateApplyViewedResponse>({
    url: `/apply-monitor/apply/${applyId}/viewed`,
    method: "patch",
    data,
  });
};
