export const EMPLOYEE_ROLE = {
  JOBBY_USER: 1,
  EMPLOYER_ADMIN: 2,
  MANAGER: 3,
  HR: 4,
  STAFF: 5,
} as const;

export const EMPLOYEE_ROLE_IDS = [
  EMPLOYEE_ROLE.JOBBY_USER,
  EMPLOYEE_ROLE.EMPLOYER_ADMIN,
  EMPLOYEE_ROLE.MANAGER,
  EMPLOYEE_ROLE.HR,
  EMPLOYEE_ROLE.STAFF,
] as const;

export type EmployeeRoleId = (typeof EMPLOYEE_ROLE_IDS)[number];

export const EMPLOYEE_ROLE_NAME_BY_ID: Record<EmployeeRoleId, string> = {
  [EMPLOYEE_ROLE.JOBBY_USER]: 'jobby_user',
  [EMPLOYEE_ROLE.EMPLOYER_ADMIN]: 'employer_admin',
  [EMPLOYEE_ROLE.MANAGER]: 'manager',
  [EMPLOYEE_ROLE.HR]: 'hr',
  [EMPLOYEE_ROLE.STAFF]: 'staff',
};
