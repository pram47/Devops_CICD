import type {
  ErrorResponseProps,
  SuccessResponse,
} from "@/types/apiServiceTypes";
import axios, { type AxiosResponse } from "axios";

export const formatError = (err: unknown): ErrorResponseProps => {
  if (axios.isAxiosError(err)) {
    const response = err.response;
    const payload = response?.data ?? {};

    if (
      payload &&
      typeof payload === "object" &&
      ("status" in payload || "code" in payload || "message" in payload)
    ) {
      const p = payload as Partial<ErrorResponseProps>;
      return {
        status: p.status ?? response?.status ?? err.status ?? 0,
        code: p.code ?? err.code ?? "000000",
        message:
          p.message ??
          response?.statusText ??
          err.message ??
          "Unexpected error",
      };
    } else {
      const fallbackStatus = response?.status ?? err.status ?? 0;
      const fallbackCode = err.code ?? "000000";
      const fallbackMessage =
        response?.statusText ?? err.message ?? "Unexpected error";

      return {
        status: fallbackStatus,
        code: fallbackCode,
        message: fallbackMessage,
      };
    }
  } else {
    return {
      status: 0,
      code: "000000",
      message: "Unexpected error",
    };
  }
};

const isAxiosResponse = <T = unknown>(res: unknown): res is AxiosResponse<T> =>
  typeof res === "object" &&
  res !== null &&
  "status" in res &&
  "data" in res &&
  "statusText" in res;

export const formatResponse = <T>(res: unknown): SuccessResponse<T> => {
  if (isAxiosResponse<T>(res)) {
    const payload = res.data as T;
    return {
      data: payload,
      status: res.status,
      message: res.statusText,
    };
  }

  throw {
    status: 0,
    code: "000000",
    message: "Unexpected response shape",
  };
};
