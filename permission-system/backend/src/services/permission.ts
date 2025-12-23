import { 
  Permission, 
  CreatePermissionRequest, 
  UpdatePermissionRequest 
} from '../types/shared';
import { PermissionModel } from '../models';

export class PermissionService {
  private permissionModel: PermissionModel;

  constructor() {
    this.permissionModel = new PermissionModel();
  }

  public async createPermission(createPermissionRequest: CreatePermissionRequest): Promise<Permission> {
    const { name, resource, action, description } = createPermissionRequest;

    const existingPermission = await this.permissionModel.existsByName(name);
    if (existingPermission) {
      throw new Error('权限名称已存在');
    }

    const existingPermissionByResourceAction = await this.permissionModel.existsByResourceAndAction(
      resource, 
      action
    );
    if (existingPermissionByResourceAction) {
      throw new Error(`资源 ${resource} 的 ${action} 权限已存在`);
    }

    const permission = await this.permissionModel.create({
      name,
      resource,
      action,
      description,
    });

    return permission;
  }

  public async updatePermission(id: string, updates: UpdatePermissionRequest): Promise<Permission | null> {
    const existingPermission = await this.permissionModel.findById(id);
    if (!existingPermission) {
      throw new Error('权限不存在');
    }

    if (updates.name && updates.name !== existingPermission.name) {
      const existingPermissionByName = await this.permissionModel.existsByName(updates.name);
      if (existingPermissionByName) {
        throw new Error('权限名称已存在');
      }
    }

    if (updates.resource && updates.action) {
      const existingPermissionByResourceAction = await this.permissionModel.existsByResourceAndAction(
        updates.resource, 
        updates.action
      );
      if (existingPermissionByResourceAction) {
        const existingPermission = await this.permissionModel.findByResourceAndAction(
          updates.resource, 
          updates.action
        );
        if (existingPermission && existingPermission.id !== id) {
          throw new Error(`资源 ${updates.resource} 的 ${updates.action} 权限已存在`);
        }
      }
    }

    const updatedPermission = await this.permissionModel.update(id, updates);
    return updatedPermission;
  }

  public async getAllPermissions(): Promise<Permission[]> {
    return await this.permissionModel.findAll();
  }

  public async getPermissionById(id: string): Promise<Permission | null> {
    return await this.permissionModel.findById(id);
  }

  public async getPermissionByName(name: string): Promise<Permission | null> {
    return await this.permissionModel.findByName(name);
  }

  public async getPermissionsByResource(resource: string): Promise<Permission[]> {
    return await this.permissionModel.findByResource(resource);
  }

  public async deletePermission(id: string): Promise<boolean> {
    return await this.permissionModel.delete(id);
  }

  public async permissionExists(id: string): Promise<boolean> {
    return await this.permissionModel.exists(id);
  }
}