export type AccountManagementItem = {
  id: number;
  employeeId: string;
  name: string;
  email: string;
  role: "Admin" | "Recruiter" | "HR";
};

export interface GetEmployeeListParams {
  page?: number;
  limit?: number;
}

export interface EmployeeListItem {
  id: string;
  user_id: string;
  company_id: string;
  email: string;
  role: number;
  first_name: string | null;
  last_name: string | null;
  role_name: string;
}

export interface GetEmployeeListResponse {
  data: EmployeeListItem[];
  page: number;
  limit: number;
  total: number;
}

export interface AssignUserRequest {
  company_id: string;
  email: string;
  role: number;
}

export interface AssignUserResponse {
  company_id: string;
  email: string;
  role: number;
}

export interface DeleteEmployeeParams {
  user_id: string;
}

export interface DeleteEmployeeResponse {
  company_id: string;
  email: string;
  role: number;
}
