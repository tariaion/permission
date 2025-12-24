import fs from 'fs';
import path from 'path';
import { config } from '../config';

export interface JsonStoreOptions {
  dataDir?: string;
  pretty?: boolean;
  encoding?: BufferEncoding;
}

export class JsonStore<T extends { id: string }> {
  private filePath: string;
  private data: T[] = [];
  private options: Required<JsonStoreOptions>;

  constructor(filename: string, options: JsonStoreOptions = {}) {
    this.options = {
      dataDir: options.dataDir || config.dataDir,
      pretty: options.pretty !== false,
      encoding: options.encoding || 'utf8',
    };
    
    // 简化路径处理
    this.filePath = path.join(process.cwd(), this.options.dataDir, filename);
    
    // 确保数据目录存在
    this.ensureDataDir();
    this.loadData();
  }

  private ensureDataDir(): void {
    try {
      const dirPath = path.dirname(this.filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }
    } catch (error) {
      console.error('Failed to ensure data directory:', error);
    }
  }

  private loadData(): void {
    try {
      if (fs.existsSync(this.filePath)) {
        const content = fs.readFileSync(this.filePath, this.options.encoding);
        this.data = JSON.parse(content);
      } else {
        this.data = [];
      }
    } catch (error) {
      console.error(`Error loading data from ${this.filePath}:`, error);
      this.data = [];
    }
  }

  private saveData(): void {
    try {
      const content = JSON.stringify(this.data, null, this.options.pretty ? 2 : 0);
      fs.writeFileSync(this.filePath, content, this.options.encoding);
    } catch (error) {
      console.error(`Error saving data to ${this.filePath}:`, error);
      throw error;
    }
  }

  public findAll(): T[] {
    return [...this.data];
  }

  public findById(id: string): T | undefined {
    return this.data.find(item => item.id === id);
  }

  public findOne(predicate: (item: T) => boolean): T | undefined {
    return this.data.find(predicate);
  }

  public findMany(predicate: (item: T) => boolean): T[] {
    return this.data.filter(predicate);
  }

  public create(item: Omit<T, 'id'>): T {
    const newItem = {
      ...item,
      id: this.generateId(),
    } as T;
    
    this.data.push(newItem);
    this.saveData();
    return newItem;
  }

  public update(id: string, updates: Partial<T>): T | null {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      return null;
    }

    this.data[index] = { ...this.data[index], ...updates };
    this.saveData();
    return this.data[index];
  }

  public delete(id: string): boolean {
    const index = this.data.findIndex(item => item.id === id);
    if (index === -1) {
      return false;
    }

    this.data.splice(index, 1);
    this.saveData();
    return true;
  }

  public exists(id: string): boolean {
    return this.data.some(item => item.id === id);
  }

  public count(): number {
    return this.data.length;
  }

  public clear(): void {
    this.data = [];
    this.saveData();
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  public reload(): void {
    this.loadData();
  }
}