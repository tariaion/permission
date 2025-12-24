import { Group, CreateGroupRequest, UpdateGroupRequest } from '../types/shared';
import { JsonStore } from '../utils/json-store';

export class GroupModel {
  private store: JsonStore<Group>;

  constructor() {
    this.store = new JsonStore<Group>('groups.json');
  }

  public async createGroup(data: CreateGroupRequest): Promise<Group> {
    const groups = await this.store.read('groups.json') || [];
    
    const newGroup: Group = {
      id: this.generateId(),
      name: data.name,
      description: data.description,
      departmentId: data.departmentId,
      leaderId: data.leaderId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    groups.push(newGroup);
    await this.store.write('groups.json', groups);
    
    return newGroup;
  }

  public async getAllGroups(): Promise<Group[]> {
    return this.store.read('groups.json') || [];
  }

  public async getGroupById(id: string): Promise<Group | null> {
    const groups = await this.getAllGroups();
    return groups.find(group => group.id === id) || null;
  }

  public async getGroupsByDepartment(departmentId: string): Promise<Group[]> {
    const groups = await this.getAllGroups();
    return groups.filter(group => group.departmentId === departmentId);
  }

  public async updateGroup(id: string, data: UpdateGroupRequest): Promise<Group | null> {
    const groups = await this.getAllGroups();
    const groupIndex = groups.findIndex(group => group.id === id);
    
    if (groupIndex === -1) {
      return null;
    }

    groups[groupIndex] = {
      ...groups[groupIndex],
      ...data,
      updatedAt: new Date(),
    };

    await this.store.write('groups.json', groups);
    return groups[groupIndex];
  }

  public async deleteGroup(id: string): Promise<boolean> {
    const groups = await this.getAllGroups();
    const filteredGroups = groups.filter(group => group.id !== id);
    
    if (filteredGroups.length === groups.length) {
      return false;
    }

    await this.store.write('groups.json', filteredGroups);
    return true;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}