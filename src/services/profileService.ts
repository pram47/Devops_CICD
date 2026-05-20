import apiService from "./apiService";
import type {
  ProfileCompanyJobListResponse,
  ProfileCompanyProfileResponse,
  ProfileGetCompanyJobListParams,
  ProfileUpdateCompanyAboutRequest,
  ProfileUpdateCompanyAboutResponse,
  ProfileUpdateCompanyAdditionInformationRequest,
  ProfileUpdateCompanyAdditionInformationResponse,
  ProfileUpdateCompanyInfoRequest,
  ProfileUpdateCompanyInfoResponse,
  ProfileUpdateCompanyMediaRequest,
  ProfileUpdateCompanyMediaResponse,
} from "@/types/profileTypes";

export type {
  ProfileCompanyJobListItem,
  ProfileCompanyJobListResponse,
  ProfileCompanyAddressCountryRef,
  ProfileCompanyAddressDistrictRef,
  ProfileCompanyAddressProvinceRef,
  ProfileCompanyAddressSubDistrictRef,
  ProfileCompanyCategoryItem,
  ProfileCompanyContactItem,
  ProfileCompanyPostalCodeRef,
  ProfileCompanyProfileResponse,
  ProfileGetCompanyJobListParams,
  ProfileUpdateCompanyAboutRequest,
  ProfileUpdateCompanyAboutResponse,
  ProfileUpdateCompanyAdditionConditionRequest,
  ProfileUpdateCompanyAdditionConditionResponse,
  ProfileUpdateCompanyAdditionInformationRequest,
  ProfileUpdateCompanyAdditionInformationResponse,
  ProfileUpdateCompanyInfoContactItem,
  ProfileUpdateCompanyInfoRequest,
  ProfileUpdateCompanyInfoResponse,
  ProfileUpdateCompanyMediaRequest,
  ProfileUpdateCompanyMediaResponse,
} from "@/types/profileTypes";

// get {{employer-bff}}/company/user/:user_id/company-id
export const apiGetCompanyIdByUserId = (userId: string) => {
  return apiService.fetchData<{
    user_id: string;
    company_id: string;
    company_ids: string[];
  }>({
    url: `/company/user/${userId}/company-id`,
    method: "get",
  });
};

// get {{employer-bff}}/company/:company_id     company profile
export const apiGetProfileCompanyProfile = (companyId: string) => {
  return apiService.fetchData<ProfileCompanyProfileResponse>({
    url: `/company/${companyId}`,
    method: "get",
  });
};

// get {{employer-bff}}/company/:company_id/job?page=0&limit=10     Job List
export const apiGetProfileCompanyJobList = (
  companyId: string,
  params: ProfileGetCompanyJobListParams = {},
) => {
  const { page = 0, limit = 10 } = params;

  return apiService.fetchData<ProfileCompanyJobListResponse>({
    url: `/company/${companyId}/job`,
    method: "get",
    params: {
      page,
      limit,
    },
  });
};

// patch {{employer-bff}}/company/:company_id/info     update info
export const apiPatchProfileCompanyInfo = (
  companyId: string,
  data: ProfileUpdateCompanyInfoRequest,
) => {
  return apiService.fetchData<ProfileUpdateCompanyInfoResponse>({
    url: `/company/${companyId}/info`,
    method: "patch",
    data,
  });
};

// patch {{employer-bff}}/company/:company_id/media     update media
export const apiPatchProfileCompanyMedia = (
  companyId: string,
  data: ProfileUpdateCompanyMediaRequest,
) => {
  const formData = new FormData();

  if (data.logo) {
    formData.append("logo", data.logo);
  }

  if (data.banner) {
    formData.append("banner", data.banner);
  }

  return apiService.fetchData<ProfileUpdateCompanyMediaResponse>({
    url: `/company/${companyId}/media`,
    method: "patch",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// patch {{employer-bff}}/company/:company_id/about     update about
export const apiPatchProfileCompanyAbout = (
  companyId: string,
  data: ProfileUpdateCompanyAboutRequest,
) => {
  return apiService.fetchData<ProfileUpdateCompanyAboutResponse>({
    url: `/company/${companyId}/about`,
    method: "patch",
    data,
  });
};

// patch {{employer-bff}}/company/:company_id/addition-information     update addition-condition
export const apiPatchProfileCompanyAdditionInformation = (
  companyId: string,
  data: ProfileUpdateCompanyAdditionInformationRequest,
) => {
  return apiService.fetchData<ProfileUpdateCompanyAdditionInformationResponse>({
    url: `/company/${companyId}/addition-information`,
    method: "patch",
    data,
  });
};

// patch {{employer-bff}}/company/:company_id/addition-information     update addition-condition
export const apiPatchProfileCompanyAdditionCondition = (
  companyId: string,
  data: ProfileUpdateCompanyAdditionInformationRequest,
) => {
  return apiPatchProfileCompanyAdditionInformation(companyId, data);
};
