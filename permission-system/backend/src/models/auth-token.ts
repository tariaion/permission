import { JsonStore } from '../utils/json-store';
import { AuthToken } from '../types/shared';

export class AuthTokenModel {
  private store: JsonStore<AuthToken>;

  constructor() {
    this.store = new JsonStore<AuthToken>('auth-tokens.json');
  }

  public async findAll(): Promise<AuthToken[]> {
    return this.store.findAll();
  }

  public async findByToken(token: string): Promise<AuthToken | null> {
    const authToken = this.store.findOne(authToken => authToken.token === token);
    return authToken || null;
  }

  public async findByUserId(userId: string): Promise<AuthToken[]> {
    return this.store.findMany(authToken => authToken.userId === userId);
  }

  public async create(tokenData: Omit<AuthToken, 'id'>): Promise<AuthToken> {
    const authToken = this.store.create(tokenData);
    return authToken;
  }

  public async delete(id: string): Promise<boolean> {
    return this.store.delete(id);
  }

  public async deleteByToken(token: string): Promise<boolean> {
    const authToken = await this.findByToken(token);
    if (!authToken) {
      return false;
    }
    return this.delete(authToken.id);
  }

  public async deleteByUserId(userId: string): Promise<boolean> {
    const authTokens = await this.findByUserId(userId);
    let deletedCount = 0;
    for (const authToken of authTokens) {
      if (await this.delete(authToken.id)) {
        deletedCount++;
      }
    }
    return deletedCount > 0;
  }

  public async deleteExpired(): Promise<number> {
    const now = new Date();
    const expiredTokens = this.store.findMany(token => new Date(token.expiresAt) < now);
    let deletedCount = 0;
    for (const token of expiredTokens) {
      if (await this.delete(token.id)) {
        deletedCount++;
      }
    }
    return deletedCount;
  }

  public async exists(token: string): Promise<boolean> {
    const authToken = await this.findByToken(token);
    if (!authToken) {
      return false;
    }
    return new Date(authToken.expiresAt) > new Date();
  }

  public async count(): Promise<number> {
    return this.store.count();
  }
}