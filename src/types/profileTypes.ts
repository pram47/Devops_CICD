export interface ProfileCompanyAddressCountryRef {
  country_code: number;
  country_name_th: string;
  country_name_en: string;
}

export interface ProfileCompanyAddressProvinceRef {
  province_code: number;
  province_name_th: string;
  province_name_en: string;
  country_id: number;
}

export interface ProfileCompanyAddressDistrictRef {
  district_code: number;
  district_name_th: string;
  district_name_en: string;
  province_id: number;
}

export interface ProfileCompanyAddressSubDistrictRef {
  sub_district_code: number;
  sub_district_name_th: string;
  sub_district_name_en: string;
  district_id: number;
}

export interface ProfileCompanyPostalCodeRef {
  id: number;
  postal_code: string;
  sub_district_id: number;
}

export interface ProfileCompanyCategoryItem {
  [key: string]: unknown;
}

export interface ProfileCompanyContactItem {
  id: string;
  index: number;
  company_id: string;
  label: string;
  link: string;
}

export interface ProfileCompanyProfileResponse {
  id: string;
  name: string;
  logo: string | null;
  banner: string | null;
  email: string;
  phone: string;
  phone_region: string | null;
  about: string | null;
  activities: string | null;
  addition_information: string;
  addition_information_rtf: string;
  address_line: string;
  no: string;
  moo: string;
  soi: string;
  street: string;
  sub_district_id: number | null;
  district_id: number | null;
  province_id: number | null;
  country_id: number | null;
  postal_code_id: number | null;
  country: ProfileCompanyAddressCountryRef | null;
  province: ProfileCompanyAddressProvinceRef | null;
  district: ProfileCompanyAddressDistrictRef | null;
  sub_district: ProfileCompanyAddressSubDistrictRef | null;
  postal_code: ProfileCompanyPostalCodeRef | null;
  categories: ProfileCompanyCategoryItem[];
  contacts: ProfileCompanyContactItem[];
}

export interface ProfileUpdateCompanyInfoContactItem {
  index: number;
  label: string;
  link: string;
}

export interface ProfileUpdateCompanyInfoRequest {
  name: string;
  email: string;
  phone: string;
  phone_region: string;
  address_line: string;
  no: string;
  moo: string;
  soi: string;
  street: string;
  sub_district_id?: number;
  district_id?: number;
  province_id?: number;
  country_id?: number;
  postal_code?: number;
  contacts: ProfileUpdateCompanyInfoContactItem[];
}

export interface ProfileUpdateCompanyInfoResponse {
  name: string;
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
  postal_code: number;
  contacts: ProfileUpdateCompanyInfoContactItem[];
}

export interface ProfileUpdateCompanyMediaRequest {
  logo?: File | null;
  banner?: File | null;
}

export interface ProfileUpdateCompanyMediaResponse {
  logo?: string | null;
  banner?: string | null;
  [key: string]: unknown;
}

export interface ProfileUpdateCompanyAboutRequest {
  about: string;
}

export interface ProfileUpdateCompanyAboutResponse {
  about: string;
}

export interface ProfileGetCompanyJobListParams {
  page?: number;
  limit?: number;
}

export interface ProfileCompanyJobListItem {
  id: string;
  company_id: string;
  name: string;
  status: number;
  created_at: string;
  start_apply: string | null;
  end_apply: string | null;
  applied_count: number;
  province: ProfileCompanyAddressProvinceRef | null;
  district: ProfileCompanyAddressDistrictRef | null;
}

export interface ProfileCompanyJobListResponse {
  data: ProfileCompanyJobListItem[];
  page: number;
  limit: number;
  total: number;
}

export interface ProfileUpdateCompanyAdditionInformationRequest {
  addition_information: string;
  addition_information_rtf: string;
}

export interface ProfileUpdateCompanyAdditionInformationResponse {
  addition_information: string;
  addition_information_rtf: string;
}

export type ProfileUpdateCompanyAdditionConditionRequest =
  ProfileUpdateCompanyAdditionInformationRequest;

export type ProfileUpdateCompanyAdditionConditionResponse =
  ProfileUpdateCompanyAdditionInformationResponse;
