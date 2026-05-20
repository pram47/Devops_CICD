export type UtilityProvinceItem = {
  province_code: number;
  province_name_th: string;
  province_name_en: string;
  country_id: number;
};

export type UtilityDistrictItem = {
  district_code: number;
  district_name_th: string;
  district_name_en: string;
  province_id: number;
};

export type UtilitySubDistrictItem = {
  sub_district_code: number;
  sub_district_name_th: string;
  sub_district_name_en: string;
  district_id: number;
};

export type UtilityPostalCodeItem = {
  id: number;
  postal_code: string;
  sub_district_id: number;
};

export type UtilityCountryRef = {
  country_code: number;
  country_name_th: string;
  country_name_en: string;
};

export type UtilityProvinceRef = {
  province_code: number;
  province_name_th: string;
  province_name_en: string;
  country_id: number;
};

export type UtilityDistrictsByProvinceResponse = UtilityProvinceRef & {
  country: UtilityCountryRef;
  districts: UtilityDistrictItem[];
};

export type UtilitySubDistrictsByDistrictResponse = UtilityDistrictItem & {
  province: UtilityProvinceRef;
  sub_districts: UtilitySubDistrictItem[];
};

export type UtilityProvincesResponse = UtilityProvinceItem[];
export type UtilityPostalCodesBySubDistrictResponse = UtilityPostalCodeItem[];

export type UtilityOptionTypeItem = {
  id: number;
  text_th: string;
  text_eng: string;
};

export type UtilityOptionTypeResponse = {
  work_types?: UtilityOptionTypeItem[];
  work_options?: UtilityOptionTypeItem[];
  work_category?: UtilityOptionTypeItem[];
  apply_status?: UtilityOptionTypeItem[];
  job_status?: UtilityOptionTypeItem[];
  sort_by?: UtilityOptionTypeItem[];
};

export type ExportResumeResponse = {
  blob: Blob;
  contentType: string;
  filename: string;
};
