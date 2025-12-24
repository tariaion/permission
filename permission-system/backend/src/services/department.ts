import { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/shared';
import { DepartmentModel } from '../models/department';
import { PermissionChecker } from './permission-checker';

export class DepartmentService {
  private departmentModel: DepartmentModel;
  private permissionChecker: PermissionChecker;

  constructor() {
    this.departmentModel = new DepartmentModel();
    this.permissionChecker = new PermissionChecker();
  }

  public async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    // 验证部门领导是否存在
    if (data.leaderId) {
      const authService = (await import('./auth')).AuthService;
      const auth = new authService();
      const leader = await auth.getUserById(data.leaderId);
      if (!leader) {
        throw new Error('指定的部门领导不存在');
      }
    }

    return this.departmentModel.createDepartment(data);
  }

  public async getAllDepartments(user?: any): Promise<Department[]> {
    const departments = await this.departmentModel.getAllDepartments();
    
    // 如果没有用户信息，返回所有部门
    if (!user) {
      return departments;
    }

    // 根据用户权限过滤部门
    if (user.position === 'admin') {
      return departments;
    }

    if (user.position === 'department_leader' && user.departmentId) {
      return departments.filter(department => department.id === user.departmentId);
    }

    // 其他用户只能看到自己所在的部门
    if (user.departmentId) {
      return departments.filter(department => department.id === user.departmentId);
    }

    return [];
  }

  public async getDepartmentById(id: string, user?: any): Promise<Department | null> {
    const department = await this.departmentModel.getDepartmentById(id);
    
    if (!department) {
      return null;
    }

    // 权限检查
    if (!user) {
      return department;
    }

    const context = {
      user,
      targetDepartmentId: id,
      action: 'read',
      resource: 'departments'
    };

    const hasAccess = await this.permissionChecker.checkPermissionWithContext(context);
    return hasAccess ? department : null;
  }

  public async updateDepartment(id: string, data: UpdateDepartmentRequest, user: any): Promise<Department | null> {
    const context = {
      user,
      targetDepartmentId: id,
      action: 'update',
      resource: 'departments'
    };

    const hasAccess = await this.permissionChecker.checkPermissionWithContext(context);
    if (!hasAccess) {
      throw new Error('权限不足：无法更新该部门');
    }

    // 验证新部门领导是否存在
    if (data.leaderId) {
      const authService = (await import('./auth')).AuthService;
      const auth = new authService();
      const leader = await auth.getUserById(data.leaderId);
      if (!leader) {
        throw new Error('指定的部门领导不存在');
      }
    }

    return this.departmentModel.updateDepartment(id, data);
  }

  public async deleteDepartment(id: string, user: any): Promise<boolean> {
    const context = {
      user,
      targetDepartmentId: id,
      action: 'delete',
      resource: 'departments'
    };

    const hasAccess = await this.permissionChecker.checkPermissionWithContext(context);
    if (!hasAccess) {
      throw new Error('权限不足：无法删除该部门');
    }

    return this.departmentModel.deleteDepartment(id);
  }
}