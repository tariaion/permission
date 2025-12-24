import { JsonStore } from '../utils/json-store';
import { RoutePermission, CreateRoutePermissionRequest, UpdateRoutePermissionRequest } from '../types/shared';

export class RoutePermissionModel {
  private store: JsonStore<RoutePermission>;

  constructor() {
    this.store = new JsonStore<RoutePermission>('route-permissions.json');
  }

  public async findAll(): Promise<RoutePermission[]> {
    return this.store.findAll();
  }

  public async findById(id: string): Promise<RoutePermission | null> {
    const routePermission = this.store.findById(id);
    return routePermission || null;
  }

  public async findByPathAndMethod(path: string, method: string): Promise<RoutePermission | null> {
    const routePermission = this.store.findOne(rp => rp.path === path && rp.method === method);
    return routePermission || null;
  }

  public async findByPath(path: string): Promise<RoutePermission[]> {
    const routePermissions = await this.findAll();
    return routePermissions.filter(rp => rp.path === path);
  }

  public async create(routePermissionData: CreateRoutePermissionRequest): Promise<RoutePermission> {
    const now = new Date();
    const routePermission = this.store.create({
      ...routePermissionData,
      id: this.generateId(),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    return routePermission;
  }

  public async update(id: string, updates: UpdateRoutePermissionRequest): Promise<RoutePermission | null> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    return this.store.update(id, updateData);
  }

  public async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  public async exists(id: string): Promise<boolean> {
    return this.store.exists(id);
  }

  public async existsByPathAndMethod(path: string, method: string): Promise<boolean> {
    const routePermission = await this.findByPathAndMethod(path, method);
    return routePermission !== null;
  }

  public async count(): Promise<number> {
    return this.store.count();
  }

  public async getActiveRoutePermissions(): Promise<RoutePermission[]> {
    const routePermissions = await this.findAll();
    return routePermissions.filter(rp => rp.isActive);
  }

  public async getRoutePermissionsByPermission(permissionId: string): Promise<RoutePermission[]> {
    const routePermissions = await this.findAll();
    return routePermissions.filter(rp => 
      rp.requiredPermissions.includes(permissionId) ||
      (rp.optionalPermissions && rp.optionalPermissions.includes(permissionId))
    );
  }

  public async getRequiredPermissionsForRoute(path: string, method: string): Promise<string[]> {
    const routePermission = await this.findByPathAndMethod(path, method);
    return routePermission ? routePermission.requiredPermissions : [];
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}