export interface GetJobMonitorJobsParams {
  search?: string;
  job_status_id?: number;
  sort_by_id?: number;
  page?: number;
  limit?: number;
}

export interface JobMonitorJobItem {
  id: string;
  [key: string]: unknown;
}

export interface GetJobMonitorJobsResponse {
  items: JobMonitorJobItem[];
  total?: number;
  page?: number;
  limit?: number;
  total_pages?: number;
  [key: string]: unknown;
}

export interface ApplyMonitorSearchJobParams {
  applyStatusId?: number;
  search?: string;
  workType?: string;
  jobName?: string;
  skill?: string;
  userSkillMoreThan?: number;
  experienceMoreThan?: number;
  achievementMoreThan?: number;
  projectMoreThan?: number;
  yearExperienceMoreThan?: number;
  starredOnly?: boolean;
  sortById?: number;
  jobStatusIds?: number[];
  page?: number;
  limit?: number;
}

export interface ApplyMonitorSearchJobItem {
  job_id: string;
  job_name: string;
  status: string;
  date_range: string;
  applied_count: number;
  new_applied_count: number;
}

export interface ApplyMonitorSearchJobResponse {
  section: string;
  total: number;
  page: number;
  limit: number;
  items: ApplyMonitorSearchJobItem[];
}

export interface ApplyMonitorOptionItem {
  id: number;
  text_th: string;
  text_eng: string;
}

export interface ApplyMonitorOptionsResponse {
  applyStatus: ApplyMonitorOptionItem[];
  sortBy: ApplyMonitorOptionItem[];
}

export interface ApplyMonitorJobAppliesParams {
  applyStatusId?: number;
  search?: string;
  skillIds?: string;
  userSkillMoreThan?: number;
  experienceMoreThan?: number;
  achievementMoreThan?: number;
  projectMoreThan?: number;
  yearExperienceMoreThan?: number;
  starredOnly?: boolean;
  sortById?: number;
  page?: number;
  limit?: number;
}

export interface ApplyStatusName {
  th: string;
  en: string;
}

export interface ApplyMonitorJobApplyItem {
  id: string;
  status: number;
  status_name: ApplyStatusName;
  created_at: string;
  user_name: string;
  job_id: string;
  job_name: string;
  match_skill: number;
  is_viewed: boolean;
  is_star: boolean;
}

export interface ApplyMonitorJobAppliesResponse {
  data: ApplyMonitorJobApplyItem[];
  page: number;
  limit: number;
  total: number;
}

export interface ApplyMonitorSearchApplyParams {
  search?: string;
  applyStatusId?: number[];
  jobStatus?: number[];
  workType?: number[];
  jobName?: string;
  skillIds?: string[];
  sortById?: number;
  page?: number;
  limit?: number;
}

export interface ApplyMonitorSearchApplyItem {
  id: string;
  status: number;
  status_name: ApplyStatusName;
  created_at: string;
  user_name: string;
  job_id: string;
  job_name: string;
  match_skill: number;
  is_viewed: boolean;
  is_star: boolean;
}

export interface ApplyMonitorSearchApplyResponse {
  data: ApplyMonitorSearchApplyItem[];
  page: number;
  limit: number;
  total: number;
}

export interface ApplyMonitorOptionJobSkillsParams {
  searchName?: string;
}

export interface ApplyMonitorOptionSkillItem {
  eid: string;
  name: string;
}

export interface ApplyMonitorOptionJobSkillsResponse {
  skills: ApplyMonitorOptionSkillItem[];
}

export interface ApplyMonitorApplyDetailUser {
  id: string;
  login_type: number;
  login_option: number;
  allow_scout: boolean;
  email: string;
  password: string | null;
  first_name: string;
  last_name: string;
  logo: string | null;
  banner: string | null;
  phone: string;
  phone_region: string | null;
  date_of_birth: string | null;
  about: string | null;
  about_rtf: string | null;
  gender: string | null;
  quote: string | null;
  address_line: string | null;
  no: string | null;
  moo: string | null;
  soi: string | null;
  street: string | null;
  sub_district_id: number | null;
  district_id: number | null;
  province_id: number | null;
  country_id: number | null;
  postal_code_id: number | null;
  viewed_job_ids: string[];
}

export interface ApplyMonitorApplyDetailJob {
  id: string;
  eid: string;
  status: number;
  created_at: string;
  name: string;
  description: string | null;
  description_rtf: string | null;
  start_apply: string | null;
  end_apply: string | null;
  cover_letter: boolean;
  work_experience: boolean;
  education: boolean;
  address_line: string | null;
  no: string | null;
  moo: string | null;
  soi: string | null;
  street: string | null;
  company_id: string;
  sub_district_code: number | null;
  district_code: number | null;
  province_code: number | null;
  country_code: number | null;
  postal_code: number | null;
}

export interface ApplyMonitorResumeAddressCountry {
  country_code: number;
  country_name_th: string;
  country_name_en: string;
}

export interface ApplyMonitorResumeAddressProvince {
  province_code: number;
  province_name_th: string;
  province_name_en: string;
  country_id: number;
}

export interface ApplyMonitorResumeAddressDistrict {
  district_code: number;
  district_name_th: string;
  district_name_en: string;
  province_id: number;
}

export interface ApplyMonitorResumeAddressSubDistrict {
  sub_district_code: number;
  sub_district_name_th: string;
  sub_district_name_en: string;
  district_id: number;
}

export interface ApplyMonitorResumeContact {
  id: string;
  index: number;
  resume_id: string;
  label: string;
  link: string;
}

export interface ApplyMonitorResumeEducation {
  id: string;
  index: number;
  resume_id: string;
  school_name: string;
  logo: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date: string | null;
  gpax: string;
}

export interface ApplyMonitorResumeWorkExperience {
  id: string;
  index: number;
  resume_id: string;
  position: string;
  logo: string;
  company_name: string;
  start_date: string;
  end_date: string | null;
  work_type: string;
  work_type_id: number;
}

export interface ApplyMonitorResumeProject {
  id: string;
  index: number;
  resume_id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string | null;
}

export interface ApplyMonitorResumeAchievement {
  id: string;
  index: number;
  resume_id: string;
  name: string;
  project_name: string;
  description: string;
  date: string;
}

export interface ApplyMonitorResumeSkill {
  id: string;
  index: number;
  resume_id: string;
  skill_id: string;
  skill_name: string;
}

export interface ApplyMonitorApplyDetailResume {
  id: string;
  name: string;
  create_date: string;
  theme: number;
  color: number;
  resume_file?: string | null;
  resume_file_metadata?: Record<string, unknown> | null;
  user_id: string;
  first_name: string;
  last_name: string;
  logo: string;
  email: string;
  phone: string;
  phone_region: string;
  address_line: string;
  no: string;
  moo: string;
  soi: string;
  street: string;
  sub_district_id: number;
  district_id: number;
  province_id: number;
  country_id: number;
  postal_code_id: number | null;
  user: ApplyMonitorApplyDetailUser;
  country: ApplyMonitorResumeAddressCountry;
  province: ApplyMonitorResumeAddressProvince;
  district: ApplyMonitorResumeAddressDistrict;
  sub_district: ApplyMonitorResumeAddressSubDistrict;
  postal_code: number | null;
  contacts: ApplyMonitorResumeContact[];
  educations: ApplyMonitorResumeEducation[];
  work_experiences: ApplyMonitorResumeWorkExperience[];
  projects: ApplyMonitorResumeProject[];
  achievements: ApplyMonitorResumeAchievement[];
  skills: ApplyMonitorResumeSkill[];
}

export interface ApplyMonitorApplyDetailResponse {
  id: string;
  status: number;
  status_name: ApplyStatusName;
  created_at: string;
  user_name: string;
  job_id: string;
  job_name: string;
  match_skill: number;
  is_viewed: boolean;
  is_star: boolean;
  user: ApplyMonitorApplyDetailUser;
  job: ApplyMonitorApplyDetailJob;
  resume_detail: ApplyMonitorApplyDetailResume;
}

export interface ApplyMonitorJobDetailCategoryItem {
  id: string;
  index: number;
  job_id: string;
  category_id: number;
  category: ApplyMonitorOptionItem;
}

export interface ApplyMonitorJobDetailSkillItem {
  id: string;
  index: number;
  job_id: string;
  skill_id: string;
  skill_name: string;
}

export interface ApplyMonitorJobDetailWorkOptionItem {
  id: string;
  index: number;
  job_id: string;
  work_option_id: number;
  work_option_ref: ApplyMonitorOptionItem;
}

export interface ApplyMonitorJobDetailWorkTypeItem {
  id: string;
  index: number;
  job_id: string;
  work_type_id: number;
  work_type_ref: ApplyMonitorOptionItem;
}

export interface ApplyMonitorJobDetailPostalCodeRef {
  postal_code_id: number;
  postal_code: number;
}

export interface ApplyMonitorJobDetailResponse {
  id: string;
  eid: string;
  status: number;
  created_at: string;
  name: string;
  description: string | null;
  description_rtf: string | null;
  start_apply: string | null;
  end_apply: string | null;
  cover_letter: boolean;
  work_experience: boolean;
  education: boolean;
  address_line: string | null;
  no: string | null;
  moo: string | null;
  soi: string | null;
  street: string | null;
  company_id: string;
  sub_district_code: number | null;
  district_code: number | null;
  province_code: number | null;
  country_code: number | null;
  postal_code: number | null;
  country: ApplyMonitorResumeAddressCountry | null;
  province: ApplyMonitorResumeAddressProvince | null;
  district: ApplyMonitorResumeAddressDistrict | null;
  sub_district: ApplyMonitorResumeAddressSubDistrict | null;
  postal_code_ref: ApplyMonitorJobDetailPostalCodeRef | null;
  categories: ApplyMonitorJobDetailCategoryItem[];
  skills: ApplyMonitorJobDetailSkillItem[];
  work_options: ApplyMonitorJobDetailWorkOptionItem[];
  work_types: ApplyMonitorJobDetailWorkTypeItem[];
  status_name: string;
}

export interface ApplyMonitorStarApplyResponse {
  is_star: boolean;
}

export interface ApplyMonitorStarApplyRequest {
  is_star: boolean;
}

export interface ApplyMonitorUpdateApplyStatusRequest {
  status: number;
}

export interface ApplyMonitorUpdateApplyStatusResponse {
  status: number;
}

export interface ApplyMonitorUpdateApplyViewedRequest {
  is_viewed: boolean;
}

export interface ApplyMonitorUpdateApplyViewedResponse {
  is_viewed: boolean;
}
