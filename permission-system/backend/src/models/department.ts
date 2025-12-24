import { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/shared';
import { JsonStore } from '../utils/json-store';

export class DepartmentModel {
  private store: JsonStore<Department>;

  constructor() {
    this.store = new JsonStore<Department>('departments.json');
  }

  public async createDepartment(data: CreateDepartmentRequest): Promise<Department> {
    const departments = await this.store.read('departments.json') || [];
    
    const newDepartment: Department = {
      id: this.generateId(),
      name: data.name,
      description: data.description,
      leaderId: data.leaderId,
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    departments.push(newDepartment);
    await this.store.write('departments.json', departments);
    
    return newDepartment;
  }

  public async getAllDepartments(): Promise<Department[]> {
    return this.store.read('departments.json') || [];
  }

  public async getDepartmentById(id: string): Promise<Department | null> {
    const departments = await this.getAllDepartments();
    return departments.find(department => department.id === id) || null;
  }

  public async updateDepartment(id: string, data: UpdateDepartmentRequest): Promise<Department | null> {
    const departments = await this.getAllDepartments();
    const departmentIndex = departments.findIndex(department => department.id === id);
    
    if (departmentIndex === -1) {
      return null;
    }

    departments[departmentIndex] = {
      ...departments[departmentIndex],
      ...data,
      updatedAt: new Date(),
    };

    await this.store.write('departments.json', departments);
    return departments[departmentIndex];
  }

  public async deleteDepartment(id: string): Promise<boolean> {
    const departments = await this.getAllDepartments();
    const filteredDepartments = departments.filter(department => department.id !== id);
    
    if (filteredDepartments.length === departments.length) {
      return false;
    }

    await this.store.write('departments.json', filteredDepartments);
    return true;
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}