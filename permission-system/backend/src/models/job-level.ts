import { JsonStore } from '../utils/json-store';
import { JobLevel, CreateJobLevelRequest, UpdateJobLevelRequest } from '../types/shared';

export class JobLevelModel {
  private store: JsonStore<JobLevel>;

  constructor() {
    this.store = new JsonStore<JobLevel>('job-levels.json');
  }

  public async findAll(): Promise<JobLevel[]> {
    return this.store.findAll();
  }

  public async findById(id: string): Promise<JobLevel | null> {
    const jobLevel = this.store.findById(id);
    return jobLevel || null;
  }

  public async findByCode(code: string): Promise<JobLevel | null> {
    const jobLevel = this.store.findOne(jobLevel => jobLevel.code === code);
    return jobLevel || null;
  }

  public async findByLevel(level: number): Promise<JobLevel | null> {
    const jobLevel = this.store.findOne(jobLevel => jobLevel.level === level);
    return jobLevel || null;
  }

  public async create(jobLevelData: CreateJobLevelRequest): Promise<JobLevel> {
    const now = new Date();
    return this.store.create({
      ...jobLevelData,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  public async update(id: string, updates: UpdateJobLevelRequest): Promise<JobLevel | null> {
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
    const jobLevel = await this.findByCode(code);
    return jobLevel !== null;
  }

  public async existsByLevel(level: number): Promise<boolean> {
    const jobLevel = await this.findByLevel(level);
    return jobLevel !== null;
  }

  public async count(): Promise<number> {
    return this.store.count();
  }

  public async getActiveJobLevels(): Promise<JobLevel[]> {
    const jobLevels = await this.findAll();
    return jobLevels.filter(jobLevel => jobLevel.isActive);
  }

  public async getJobLevelsByLevelRange(minLevel: number, maxLevel: number): Promise<JobLevel[]> {
    const jobLevels = await this.findAll();
    return jobLevels.filter(jobLevel => 
      jobLevel.level >= minLevel && jobLevel.level <= maxLevel && jobLevel.isActive
    );
  }

  public async searchJobLevels(query: string): Promise<JobLevel[]> {
    const jobLevels = await this.findAll();
    const lowerQuery = query.toLowerCase();
    
    return jobLevels.filter(jobLevel => 
      jobLevel.name.toLowerCase().includes(lowerQuery) ||
      jobLevel.code.toLowerCase().includes(lowerQuery) ||
      jobLevel.description.toLowerCase().includes(lowerQuery)
    );
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }
}