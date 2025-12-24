// 重新导出共享类型
export * from './shared';

// 前端特定类型
export interface FrontendUser extends Omit<import('./shared').User, 'password'> {
  permissions?: import('./shared').Permission[];
  jobLevel?: import('./shared').JobLevel;
  effectivePermissions?: string[];
}

export interface AuthContextType {
  user: FrontendUser | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
  refreshUserPermissions?: () => Promise<void>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: FrontendUser;
  token: string;
  expiresIn: number;
}

// 路由权限配置
export interface RouteConfig {
  path: string;
  component: React.ComponentType;
  title: string;
  icon?: React.ReactNode;
  requiredPermissions?: string[];
  children?: RouteConfig[];
  hideInMenu?: boolean;
}

// 权限检查Hook返回类型
export interface PermissionCheckResult {
  hasPermission: boolean;
  permissions: string[];
  reason?: string;
}

// 菜单项类型
export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: MenuItem[];
  requiredPermissions?: string[];
}

// 表格列配置类型
export interface TableColumn<T = any> {
  key: string;
  title: string;
  dataIndex?: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  sorter?: boolean;
  fixed?: 'left' | 'right';
  filters?: { text: string; value: any }[];
  onFilter?: (value: any, record: T) => boolean;
}

// 表单字段类型
export interface FormField {
  name: string;
  label: string;
  type: 'input' | 'textarea' | 'select' | 'multiselect' | 'date' | 'number' | 'password' | 'email';
  placeholder?: string;
  required?: boolean;
  options?: Array<{ label: string; value: any }>;
  rules?: any[];
  disabled?: boolean;
  hidden?: boolean;
}

// 搜索条件类型
export interface SearchParams {
  keyword?: string;
  departmentId?: string;
  groupId?: string;
  jobLevelId?: string;
  roleId?: string;
  active?: boolean;
  page?: number;
  pageSize?: number;
}

// 分页信息类型
export interface PaginationInfo {
  current: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showQuickJumper?: boolean;
  showTotal?: (total: number, range: [number, number]) => string;
}