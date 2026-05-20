import apiService from "./apiService";
import type { AxiosResponse } from "axios";
import httpClient from "./httpClientService";
import type {
  ExportResumeResponse,
  UtilityDistrictsByProvinceResponse,
  UtilityOptionTypeResponse,
  UtilityPostalCodesBySubDistrictResponse,
  UtilityProvincesResponse,
  UtilitySubDistrictsByDistrictResponse,
} from "@/types/utilityTypes";

export type {
  UtilityCountryRef,
  UtilityDistrictItem,
  UtilityDistrictsByProvinceResponse,
  UtilityOptionTypeItem,
  UtilityOptionTypeResponse,
  UtilityPostalCodeItem,
  UtilityPostalCodesBySubDistrictResponse,
  UtilityProvinceItem,
  UtilityProvinceRef,
  UtilityProvincesResponse,
  UtilitySubDistrictItem,
  UtilitySubDistrictsByDistrictResponse,
} from "@/types/utilityTypes";

const getHeaderString = (header: unknown): string | undefined => {
  if (typeof header === "string") return header;
  if (Array.isArray(header)) {
    return typeof header[0] === "string" ? header[0] : undefined;
  }
  return undefined;
};

const parseContentDispositionFilename = (header: unknown) => {
  const headerValue = getHeaderString(header);
  if (!headerValue) return "";

  const utfMatch = headerValue.match(/filename\*=UTF-8''([^;]+)/i);
  if (utfMatch?.[1]) {
    return decodeURIComponent(utfMatch[1]);
  }

  const basicMatch = headerValue.match(/filename="?([^"]+)"?/i);
  return basicMatch?.[1] ?? "";
};

// get {{bff-service}}/utility/option-type     filter master data
export const apiGetUtilityOptionType = () => {
  return apiService.fetchData<UtilityOptionTypeResponse>({
    url: "/utility/option-type",
    method: "get",
  });
};

// get {{bff-service}}/utility/province
export const apiGetUtilityProvinces = () => {
  return apiService.fetchData<UtilityProvincesResponse>({
    url: "/utility/province",
    method: "get",
  });
};

// get {{bff-service}}/utility/district/:province_code
export const apiGetUtilityDistrictsByProvinceCode = (
  provinceCode: number | string,
) => {
  return apiService.fetchData<UtilityDistrictsByProvinceResponse>({
    url: `/utility/district/${provinceCode}`,
    method: "get",
  });
};

// get {{bff-service}}/utility/sub-district/:district_code
export const apiGetUtilitySubDistrictsByDistrictCode = (
  districtCode: number | string,
) => {
  return apiService.fetchData<UtilitySubDistrictsByDistrictResponse>({
    url: `/utility/sub-district/${districtCode}`,
    method: "get",
  });
};

// get {{bff-service}}/utility/postal-code/:sub_district_code
export const apiGetUtilityPostalCodesBySubDistrictCode = (
  subDistrictCode: number | string,
) => {
  return apiService.fetchData<UtilityPostalCodesBySubDistrictResponse>({
    url: `/utility/postal_code/${subDistrictCode}`,
    method: "get",
  });
};

// get {{bff-service}}/utility/postal-code/:sub_district_code
export const apiResumeExport = async (
  resumeId: string,
): Promise<ExportResumeResponse> => {
  const response: AxiosResponse<Blob> = await httpClient.request<Blob>({
    url: `/utility/resume/${encodeURIComponent(resumeId)}/export`,
    method: "get",
    responseType: "blob",
  });

  return {
    blob: response.data,
    contentType:
      getHeaderString(response.headers["content-type"]) ??
      "application/octet-stream",
    filename:
      parseContentDispositionFilename(
        response.headers["content-disposition"],
      ) || `resume-${resumeId}.pdf`,
  };
};
