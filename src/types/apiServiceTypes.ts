export type SuccessResponse<T> = {
  data: T;
  status: number;
  message: string;
};

export type ErrorResponseProps = {
  status: number;
  code: string;
  message: string;
};
