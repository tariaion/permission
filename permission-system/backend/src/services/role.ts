import { Role, CreateRoleRequest, UpdateRoleRequest } from '../types/shared';
import { RoleModel, PermissionModel } from '../models';

export class RoleService {
  private roleModel: RoleModel;
  private permissionModel: PermissionModel;

  constructor() {
    this.roleModel = new RoleModel();
    this.permissionModel = new PermissionModel();
  }

  public async createRole(createRoleRequest: CreateRoleRequest): Promise<Role> {
    const { name, description, permissions = [] } = createRoleRequest;

    const existingRole = await this.roleModel.existsByName(name);
    if (existingRole) {
      throw new Error('角色名称已存在');
    }

    if (permissions.length > 0) {
      for (const permissionId of permissions) {
        const permission = await this.permissionModel.findById(permissionId);
        if (!permission) {
          throw new Error(`权限 ID ${permissionId} 不存在`);
        }
      }
    }

    const role = await this.roleModel.create({
      name,
      code: name.toLowerCase().replace(/\s+/g, '_'),
      description,
      permissions,
    });

    return role;
  }

  public async updateRole(id: string, updates: UpdateRoleRequest): Promise<Role | null> {
    const existingRole = await this.roleModel.findById(id);
    if (!existingRole) {
      throw new Error('角色不存在');
    }

    if (updates.name && updates.name !== existingRole.name) {
      const existingRoleByName = await this.roleModel.existsByName(updates.name);
      if (existingRoleByName) {
        throw new Error('角色名称已存在');
      }
    }

    if (updates.permissions) {
      for (const permissionId of updates.permissions) {
        const permission = await this.permissionModel.findById(permissionId);
        if (!permission) {
          throw new Error(`权限 ID ${permissionId} 不存在`);
        }
      }
    }

    const updatedRole = await this.roleModel.update(id, updates);
    return updatedRole;
  }

  public async getAllRoles(): Promise<Role[]> {
    return await this.roleModel.findAll();
  }

  public async getRoleById(id: string): Promise<Role | null> {
    return await this.roleModel.findById(id);
  }

  public async getRoleByName(name: string): Promise<Role | null> {
    return await this.roleModel.findByName(name);
  }

  public async deleteRole(id: string): Promise<boolean> {
    return await this.roleModel.delete(id);
  }

  public async roleExists(id: string): Promise<boolean> {
    return await this.roleModel.exists(id);
  }

  public async getRolePermissions(id: string): Promise<any[]> {
    const role = await this.roleModel.findById(id);
    if (!role) {
      return [];
    }

    const permissions = [];
    for (const permissionId of role.permissions) {
      const permission = await this.permissionModel.findById(permissionId);
      if (permission) {
        permissions.push(permission);
      }
    }

    return permissions;
  }
}