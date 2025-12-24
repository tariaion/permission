import { JsonStore } from '../utils/json-store';
import { Group, CreateGroupRequest, UpdateGroupRequest } from '../types/shared';

export class GroupModel {
  private store: JsonStore<Group>;

  constructor() {
    this.store = new JsonStore<Group>('groups.json');
  }

  public async findAll(): Promise<Group[]> {
    return this.store.findAll();
  }

  public async findById(id: string): Promise<Group | null> {
    const group = this.store.findById(id);
    return group || null;
  }

  public async findByCode(code: string): Promise<Group | null> {
    const group = this.store.findOne(group => group.code === code);
    return group || null;
  }

  public async findByName(name: string): Promise<Group | null> {
    const group = this.store.findOne(group => group.name === name);
    return group || null;
  }

  public async findByDepartment(departmentId: string): Promise<Group[]> {
    const groups = await this.findAll();
    return groups.filter(group => group.departmentId === departmentId);
  }

  public async findByLeader(leaderId: string): Promise<Group[]> {
    const groups = await this.findAll();
    return groups.filter(group => group.leaderId === leaderId);
  }

  public async create(groupData: CreateGroupRequest): Promise<Group> {
    const now = new Date();
    return this.store.create({
      ...groupData,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public async update(id: string, updates: UpdateGroupRequest): Promise<Group | null> {
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

  public async existsByCode(code: string): Promise<boolean> {
    const group = await this.findByCode(code);
    return group !== null;
  }

  public async existsByName(name: string): Promise<boolean> {
    const group = await this.findByName(name);
    return group !== null;
  }

  public async count(): Promise<number> {
    return this.store.count();
  }

  public async getActiveGroups(): Promise<Group[]> {
    const groups = await this.findAll();
    return groups.filter(group => group.isActive);
  }

  public async getActiveGroupsByDepartment(departmentId: string): Promise<Group[]> {
    const groups = await this.findByDepartment(departmentId);
    return groups.filter(group => group.isActive);
  }

  public async searchGroups(query: string): Promise<Group[]> {
    const groups = await this.findAll();
    const lowerQuery = query.toLowerCase();
    
    return groups.filter(group => 
      group.name.toLowerCase().includes(lowerQuery) ||
      group.code.toLowerCase().includes(lowerQuery) ||
      group.description.toLowerCase().includes(lowerQuery)
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}