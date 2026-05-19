import type { SuccessResponse } from "@/types/apiServiceTypes";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import httpClient from "./httpClientService";
import { formatResponse } from "./serviceHandler";

const apiService = {
  async fetchData<Response>(
    param: AxiosRequestConfig,
  ): Promise<SuccessResponse<Response>> {
    const response: AxiosResponse<Response> =
      await httpClient.request<Response>(param);

    return formatResponse<Response>(response);
  },
};

export default apiService;
