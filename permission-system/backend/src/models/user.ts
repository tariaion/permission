import { JsonStore } from '../utils/json-store';
import { User } from '../types/shared';

export class UserModel {
  private store: JsonStore<User>;

  constructor() {
    this.store = new JsonStore<User>('users.json');
  }

  public async findAll(): Promise<User[]> {
    return this.store.findAll();
  }

  public async findById(id: string): Promise<User | null> {
    const user = this.store.findById(id);
    return user || null;
  }

  public async findByUsername(username: string): Promise<User | null> {
    const user = this.store.findOne(user => user.username === username);
    return user || null;
  }

  public async findByEmail(email: string): Promise<User | null> {
    const user = this.store.findOne(user => user.email === email);
    return user || null;
  }

  public async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const now = new Date();
    const user = this.store.create({
      ...userData,
      createdAt: now,
      updatedAt: now,
    });
    return user;
  }

  public async update(id: string, updates: Partial<User>): Promise<User | null> {
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

  public async existsByUsername(username: string): Promise<boolean> {
    const user = await this.findByUsername(username);
    return user !== null;
  }

  public async existsByEmail(email: string): Promise<boolean> {
    const user = await this.findByEmail(email);
    return user !== null;
  }

  public async count(): Promise<number> {
    return this.store.count();
  }
}