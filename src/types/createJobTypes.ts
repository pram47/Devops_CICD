export interface AddressRequest {
  address_line: string;
  no: string;
  moo: string;
  soi: string;
  street: string;
  sub_district_code: number;
  district_code: number;
  province_code: number;
  country_code: number;
  postal_code: number;
}

export interface SkillRequest {
  index: number;
  skill_id: string;
  skill_name: string;
}

export interface AdditionQuestionOptionRequest {
  id: number;
  label: string;
}

export interface AdditionQuestionRequest {
  id: number;
  type: number;
  question: string;
  options: AdditionQuestionOptionRequest[];
  max_select: number;
}

export interface AdditionFileRequest {
  id: number;
  type: number;
  label: string;
  description: string;
}

export interface CreateJobRequest {
  name: string;
  description: string;
  description_rtf: string;
  start_apply: string;
  end_apply: string;
  cover_letter: boolean;
  work_experience: boolean;
  education: boolean;
  company_id: string;
  address: AddressRequest;
  category_ids: number[];
  work_option_ids: number[];
  work_type_ids: number[];
  skills: SkillRequest[];
  addition_questions: AdditionQuestionRequest[];
  addition_file: AdditionFileRequest[];
}

export interface CreateJobResponse {
  id?: string;
  message?: string;
}

export interface PatchJobStatusRequest {
  status: number;
}

export interface MasterTextRef {
  id: number;
  text_th: string;
  text_eng: string;
}

export interface JobCategoryItem {
  id: string;
  index: number;
  job_id: string;
  category_id: number;
  category: MasterTextRef;
}

export interface JobSkillItem {
  id: string;
  index: number;
  job_id: string;
  skill_id: string;
  skill_name: string;
}

export interface JobWorkOptionItem {
  id: string;
  index: number;
  job_id: string;
  work_option_id: number;
  work_option_ref: MasterTextRef;
}

export interface JobWorkTypeItem {
  id: string;
  index: number;
  job_id: string;
  work_type_id: number;
  work_type_ref: MasterTextRef;
}

export interface GetJobDetailResponse {
  id: string;
  eid: string;
  status: number;
  created_at: string;
  name: string;
  description: string;
  description_rtf: string;
  start_apply: string;
  end_apply: string;
  cover_letter: boolean;
  work_experience: boolean;
  education: boolean;
  address_line: string;
  no: string;
  moo: string;
  soi: string;
  street: string;
  company_id: string;
  sub_district_code: number;
  district_code: number;
  province_code: number;
  country_code: number;
  postal_code: number;
  categories: JobCategoryItem[];
  skills: JobSkillItem[];
  work_options: JobWorkOptionItem[];
  work_types: JobWorkTypeItem[];
}

export type AddressAutoFillOption = {
  postalCode: string;
  addressLine: string;
  no: string;
  moo: string;
  soi: string;
  street: string;
  province: string;
  district: string;
  subDistrict: string;
};

export type AdditionQuestionType = "open" | "radio" | "checkbox";

export type AdditionQuestionAnswer = {
  id: string;
  text: string;
};

export type AdditionQuestionSection = {
  id: string;
  type: AdditionQuestionType;
  question: string;
  answers: AdditionQuestionAnswer[];
  maxSelect?: string;
};

export type SortableAnswerItemProps = {
  answer: AdditionQuestionAnswer;
  onChange: (value: string) => void;
};

export type Skill = {
  id: string;
  skill_id: string;
  name: string;
  category: string;
  description: string;
  preSkills: string[];
};

export type SkillSearchResultItem = {
  skill_id?: string;
  eid?: string;
  skillElementId?: string;
  id?: string;
  skill_name?: string;
  name?: string;
  category?: string;
  description?: string;
};

export type SkillDetailResponse = {
  skillElementId?: string;
  skill_id?: string;
  id?: string;
  name?: string;
  description?: string;
  pre_skills?: string[];
  preSkills?: string[];
};

export type UtilityWorkOption = {
  id: number;
  text_th: string;
  text_eng: string;
};

export type UtilityWorkType = {
  id: number;
  text_th: string;
  text_eng: string;
};

export type UtilityOptionItem = {
  id: number;
  label: string;
};

export type UtilityOptionTypeResponse = {
  work_option?: UtilityWorkOption[];
  work_options?: UtilityWorkOption[];
  work_type?: UtilityWorkType[];
  work_types?: UtilityWorkType[];
  job_status?: UtilityOptionItem[];
  sort_by?: UtilityOptionItem[];
};

export type CreateJobAddSkillPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (skill: SkillRequest) => void;
};

export type SkillDetailPopupProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  skillName: string;
  category: string;
  description: string;
  preSkills: string[];
};
