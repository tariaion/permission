import { JsonStore } from '../utils/json-store';
import { Role } from '../types/shared';

export class RoleModel {
  private store: JsonStore<Role>;

  constructor() {
    this.store = new JsonStore<Role>('roles.json');
  }

  public async findAll(): Promise<Role[]> {
    return this.store.findAll();
  }

  public async findById(id: string): Promise<Role | null> {
    const role = this.store.findById(id);
    return role || null;
  }

  public async findByName(name: string): Promise<Role | null> {
    const role = this.store.findOne(role => role.name === name);
    return role || null;
  }

  public async create(roleData: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const now = new Date();
    const role = this.store.create({
      ...roleData,
      createdAt: now,
      updatedAt: now,
    });
    return role;
  }

  public async update(id: string, updates: Partial<Role>): Promise<Role | null> {
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

  public async existsByName(name: string): Promise<boolean> {
    const role = await this.findByName(name);
    return role !== null;
  }

  public async count(): Promise<number> {
    return this.store.count();
  }
}