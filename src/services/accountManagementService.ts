import apiService from "./apiService";
import type {
  AssignUserRequest,
  AssignUserResponse,
  DeleteEmployeeParams,
  DeleteEmployeeResponse,
  GetEmployeeListParams,
  GetEmployeeListResponse,
} from "@/types/accountManagementTypes";

export type {
  AssignUserRequest,
  AssignUserResponse,
  DeleteEmployeeParams,
  DeleteEmployeeResponse,
  EmployeeListItem,
  GetEmployeeListParams,
  GetEmployeeListResponse,
} from "@/types/accountManagementTypes";

// get {{employer-bff}}/employee?page=0&limit=10     Employee List
export const apiGetEmployeeList = (params: GetEmployeeListParams = {}) => {
  const { page = 0, limit = 10 } = params;

  return apiService.fetchData<GetEmployeeListResponse>({
    url: "/employee",
    method: "get",
    params: {
      page,
      limit,
    },
  });
};

// post {{employer-bff}}/employee/assign-user     Assign user
export const apiPostAssignUser = (data: AssignUserRequest) => {
  return apiService.fetchData<AssignUserResponse>({
    url: "/employee/assign-user",
    method: "post",
    data,
  });
};

// delete {{employer-bff}}/employee?user_id=U8EWRV1eppz7AP1HmhpxVW0WuYOy7bu6     Delete Employee
export const apiDeleteEmployee = (params: DeleteEmployeeParams) => {
  return apiService.fetchData<DeleteEmployeeResponse>({
    url: "/employee",
    method: "delete",
    params,
  });
};
