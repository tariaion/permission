import { JsonStore } from '../utils/json-store';
import { Permission } from '../types/shared';

export class PermissionModel {
  private store: JsonStore<Permission>;

  constructor() {
    this.store = new JsonStore<Permission>('permissions.json');
  }

  public async findAll(): Promise<Permission[]> {
    return this.store.findAll();
  }

  public async findById(id: string): Promise<Permission | null> {
    const permission = this.store.findById(id);
    return permission || null;
  }

  public async findByName(name: string): Promise<Permission | null> {
    const permission = this.store.findOne(permission => permission.name === name);
    return permission || null;
  }

  public async findByResource(resource: string): Promise<Permission[]> {
    return this.store.findMany(permission => permission.resource === resource);
  }

  public async findByResourceAndAction(resource: string, action: string): Promise<Permission | null> {
    const permission = this.store.findOne(
      permission => permission.resource === resource && permission.action === action
    );
    return permission || null;
  }

  public async create(permissionData: Omit<Permission, 'id' | 'createdAt'>): Promise<Permission> {
    const permission = this.store.create({
      ...permissionData,
      createdAt: new Date(),
    });
    return permission;
  }

  public async update(id: string, updates: Partial<Permission>): Promise<Permission | null> {
    return this.store.update(id, updates);
  }

  public async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  public async exists(id: string): Promise<boolean> {
    return this.store.exists(id);
  }

  public async existsByName(name: string): Promise<boolean> {
    const permission = await this.findByName(name);
    return permission !== null;
  }

  public async existsByResourceAndAction(resource: string, action: string): Promise<boolean> {
    const permission = await this.findByResourceAndAction(resource, action);
    return permission !== null;
  }

  public async count(): Promise<number> {
    return this.store.count();
  }
}