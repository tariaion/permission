import { Group, CreateGroupRequest, UpdateGroupRequest } from '../types/shared';
import { GroupModel } from '../models/group';
import { DepartmentModel } from '../models/department';
import { PermissionChecker } from './permission-checker';

export class GroupService {
  private groupModel: GroupModel;
  private departmentModel: DepartmentModel;
  private permissionChecker: PermissionChecker;

  constructor() {
    this.groupModel = new GroupModel();
    this.departmentModel = new DepartmentModel();
    this.permissionChecker = new PermissionChecker();
  }

  public async createGroup(data: CreateGroupRequest): Promise<Group> {
    // 验证部门是否存在
    const department = await this.departmentModel.getDepartmentById(data.departmentId);
    if (!department) {
      throw new Error('指定的部门不存在');
    }

    // 验证组长是否存在且在该部门
    if (data.leaderId) {
      const authService = (await import('./auth')).AuthService;
      const auth = new authService();
      const leader = await auth.getUserById(data.leaderId);
      if (!leader || leader.departmentId !== data.departmentId) {
        throw new Error('指定的组长不存在或不在该部门内');
      }
    }

    return this.groupModel.createGroup(data);
  }

  public async getAllGroups(user?: any): Promise<Group[]> {
    const groups = await this.groupModel.getAllGroups();
    
    // 如果没有用户信息，返回所有组
    if (!user) {
      return groups;
    }

    // 根据用户权限过滤组
    if (user.position === 'admin') {
      return groups;
    }

    if (user.position === 'department_leader' && user.departmentId) {
      return groups.filter(group => group.departmentId === user.departmentId);
    }

    if (user.position === 'group_leader') {
      return groups.filter(group => group.leaderId === user.id);
    }

    // 普通成员只能看到自己所在的组
    if (user.groupId) {
      return groups.filter(group => group.id === user.groupId);
    }

    return [];
  }

  public async getGroupById(id: string, user?: any): Promise<Group | null> {
    const group = await this.groupModel.getGroupById(id);
    
    if (!group) {
      return null;
    }

    // 权限检查
    if (!user) {
      return group;
    }

    const context = {
      user,
      targetGroupId: id,
      action: 'read',
      resource: 'groups'
    };

    const hasAccess = await this.permissionChecker.checkPermissionWithContext(context);
    return hasAccess ? group : null;
  }

  public async updateGroup(id: string, data: UpdateGroupRequest, user: any): Promise<Group | null> {
    const context = {
      user,
      targetGroupId: id,
      action: 'update',
      resource: 'groups'
    };

    const hasAccess = await this.permissionChecker.checkPermissionWithContext(context);
    if (!hasAccess) {
      throw new Error('权限不足：无法更新该组');
    }

    // 验证新组长是否存在
    if (data.leaderId) {
      const authService = (await import('./auth')).AuthService;
      const auth = new authService();
      const leader = await auth.getUserById(data.leaderId);
      if (!leader) {
        throw new Error('指定的组长不存在');
      }
    }

    return this.groupModel.updateGroup(id, data);
  }

  public async deleteGroup(id: string, user: any): Promise<boolean> {
    const context = {
      user,
      targetGroupId: id,
      action: 'delete',
      resource: 'groups'
    };

    const hasAccess = await this.permissionChecker.checkPermissionWithContext(context);
    if (!hasAccess) {
      throw new Error('权限不足：无法删除该组');
    }

    return this.groupModel.deleteGroup(id);
  }

  public async getGroupsByDepartment(departmentId: string, user?: any): Promise<Group[]> {
    const context = {
      user,
      targetDepartmentId: departmentId,
      action: 'read',
      resource: 'groups'
    };

    if (user && !(await this.permissionChecker.checkPermissionWithContext(context))) {
      throw new Error('权限不足：无法查看该部门的组');
    }

    return this.groupModel.getGroupsByDepartment(departmentId);
  }
}