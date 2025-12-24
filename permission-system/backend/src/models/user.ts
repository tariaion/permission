import { User, CreateUserRequest, UpdateUserRequest } from '../types/shared';
import { JsonStore } from '../utils/json-store';

export class UserModel {
  private store: JsonStore<User>;

  constructor() {
    this.store = new JsonStore<User>('users.json');
  }

  public async findAll(): Promise<User[]> {
    return this.store.read('users.json') || [];
  }

  public async findById(id: string): Promise<User | null> {
    const users = await this.findAll();
    return users.find(user => user.id === id) || null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    const users = await this.findAll();
    return users.find(user => user.username === username) || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const users = await this.findAll();
    return users.find(user => user.email === email) || null;
  }

  public async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const users = await this.findAll();
    const now = new Date();
    
    const user: User = {
      id: this.generateId(),
      ...userData,
      createdAt: now,
      updatedAt: now,
    };

    users.push(user);
    await this.store.write('users.json', users);
    
    return user;
  }

  public async update(id: string, updates: Partial<User>): Promise<User | null> {
    const users = await this.findAll();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) {
      return null;
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date(),
    };

    await this.store.write('users.json', users);
    return users[userIndex];
  }

  public async delete(id: string): Promise<boolean> {
    const users = await this.findAll();
    const filteredUsers = users.filter(user => user.id !== id);
    
    if (filteredUsers.length === users.length) {
      return false;
    }

    await this.store.write('users.json', filteredUsers);
    return true;
  }

  public async exists(id: string): Promise<boolean> {
    const user = await this.findById(id);
    return user !== null;
  }

  public async existsByUsername(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user !== null;
  }

  public async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  public async count(): Promise<number> {
    const users = await this.findAll();
    return users.length;
  }

  public async getUsersByGroup(groupId: string): Promise<User[]> {
    const users = await this.findAll();
    return users.filter(user => user.groupId === groupId);
  }

  public async getUsersByDepartment(departmentId: string): Promise<User[]> {
    const users = await this.findAll();
    return users.filter(user => user.departmentId === departmentId);
  }

  public async getUsersByLeader(leaderId: string): Promise<User[]> {
    const users = await this.findAll();
    return users.filter(user => user.leaderId === leaderId);
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}