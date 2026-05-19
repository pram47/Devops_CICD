export type Permission = {
  id: string;
  feature_id: string;
  feature_name: string;
  feature_key: string;
  feature_order: number;
  parent_id: string | null;
  actions: string[];
  children: Permission[];
};

export type RoleWithPermission = {
  id: string;
  name: string;
  description: string;
  can_delete: number;
  default_route?: string | null;
  permissions: Permission[];
};

export type UserLogin = {
  username: string;
  password: string;
};

export type UserLoginResponse = {
  access_token: string;
  roles_with_permission: RoleWithPermission[];
};

export type SignIn = {
  access_token: string;
  roles_with_permission: RoleWithPermission[];
};
