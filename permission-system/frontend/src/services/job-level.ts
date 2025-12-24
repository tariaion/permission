import { apiService } from './api';
import { ApiResponse, JobLevel, CreateJobLevelRequest, UpdateJobLevelRequest } from '@/types';

export class JobLevelService {
  public async getAllJobLevels(params?: {
    active?: boolean;
    minLevel?: number;
    maxLevel?: number;
    search?: string;
  }): Promise<ApiResponse<JobLevel[]>> {
    return apiService.get('/job-levels', { params });
  }

  public async getJobLevel(id: string): Promise<ApiResponse<JobLevel>> {
    return apiService.get(`/job-levels/${id}`);
  }

  public async createJobLevel(data: CreateJobLevelRequest): Promise<ApiResponse<JobLevel>> {
    return apiService.post('/job-levels', data);
  }

  public async updateJobLevel(id: string, data: UpdateJobLevelRequest): Promise<ApiResponse<JobLevel>> {
    return apiService.put(`/job-levels/${id}`, data);
  }

  public async deleteJobLevel(id: string): Promise<ApiResponse<void>> {
    return apiService.delete(`/job-levels/${id}`);
  }

  public async getJobLevelStats(): Promise<ApiResponse<any>> {
    return apiService.get('/job-levels/stats/overview');
  }
}

export const jobLevelService = new JobLevelService();