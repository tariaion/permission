import { JsonStore } from '../utils/json-store';
import { Department, CreateDepartmentRequest, UpdateDepartmentRequest } from '../types/shared';

export class DepartmentModel {
  private store: JsonStore<Department>;

  constructor() {
    this.store = new JsonStore<Department>('departments.json');
  }

  public async findAll(): Promise<Department[]> {
    return this.store.findAll();
  }

  public async findById(id: string): Promise<Department | null> {
    const department = this.store.findById(id);
    return department || null;
  }

  public async findByCode(code: string): Promise<Department | null> {
    const department = this.store.findOne(department => department.code === code);
    return department || null;
  }

  public async findByName(name: string): Promise<Department | null> {
    const department = this.store.findOne(department => department.name === name);
    return department || null;
  }

  public async findByParentId(parentId: string): Promise<Department[]> {
    const departments = await this.findAll();
    return departments.filter(department => department.parentId === parentId);
  }

  public async findRootDepartments(): Promise<Department[]> {
    const departments = await this.findAll();
    return departments.filter(department => !department.parentId);
  }

  public async create(departmentData: CreateDepartmentRequest): Promise<Department> {
    const now = new Date();
    return this.store.create({
      ...departmentData,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public async update(id: string, updates: UpdateDepartmentRequest): Promise<Department | null> {
    const updateData = {
      ...updates,
      updatedAt: new Date(),
    };
    return this.store.update(id, updateData);
  }

  public async delete(id: string): Promise<boolean> {
    // 检查是否有子部门
    const childDepartments = await this.findByParentId(id);
    if (childDepartments.length > 0) {
      throw new Error('Cannot delete department with child departments');
    }
    return this.store.delete(id);
  }

  public async exists(id: string): Promise<boolean> {
    return this.store.exists(id);
  }

  public async existsByCode(code: string): Promise<boolean> {
    const department = await this.findByCode(code);
    return department !== null;
  }

  public async existsByName(name: string): Promise<boolean> {
    const department = await this.findByName(name);
    return department !== null;
  }

  public async count(): Promise<number> {
    return this.store.count();
  }

  public async getActiveDepartments(): Promise<Department[]> {
    const departments = await this.findAll();
    return departments.filter(department => department.isActive);
  }

  public async getDepartmentTree(): Promise<Department[]> {
    const departments = await this.getActiveDepartments();
    const departmentMap = new Map<string, Department & { children: Department[] }>();
    
    // 创建映射并初始化children数组
    departments.forEach(department => {
      departmentMap.set(department.id, { ...department, children: [] });
    });

    const rootDepartments: Department[] = [];

    // 构建树结构
    departments.forEach(department => {
      const deptWithChildren = departmentMap.get(department.id)!;
      if (department.parentId) {
        const parent = departmentMap.get(department.parentId);
        if (parent) {
          parent.children.push(deptWithChildren);
        }
      } else {
        rootDepartments.push(deptWithChildren);
      }
    });

    return rootDepartments;
  }

  public async searchDepartments(query: string): Promise<Department[]> {
    const departments = await this.findAll();
    const lowerQuery = query.toLowerCase();
    
    return departments.filter(department => 
      department.name.toLowerCase().includes(lowerQuery) ||
      department.code.toLowerCase().includes(lowerQuery) ||
      department.description.toLowerCase().includes(lowerQuery)
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}