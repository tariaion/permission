import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { 
  User, 
  LoginRequest, 
  LoginResponse, 
  CreateUserRequest,
  UpdateUserRequest 
} from '../types/shared';
import { UserModel, RoleModel, AuthTokenModel } from '../models';

export class AuthService {
  private userModel: UserModel;
  private roleModel: RoleModel;
  private authTokenModel: AuthTokenModel;

  constructor() {
    this.userModel = new UserModel();
    this.roleModel = new RoleModel();
    this.authTokenModel = new AuthTokenModel();
  }

  public async login(loginRequest: LoginRequest): Promise<LoginResponse> {
    const { username, password } = loginRequest;

    const user = await this.userModel.findByUsername(username);
    if (!user) {
      throw new Error('用户名或密码错误');
    }

    if (!user.isActive) {
      throw new Error('用户账户已被禁用');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('用户名或密码错误');
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn }
    );

    const expiresIn = this.parseExpiresIn(config.jwtExpiresIn);
    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    await this.authTokenModel.deleteByUserId(user.id);
    await this.authTokenModel.create({
      userId: user.id,
      token,
      expiresAt,
    });

    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      expiresIn,
    };
  }

  public async logout(token: string): Promise<void> {
    await this.authTokenModel.deleteByToken(token);
  }

  public async validateToken(token: string): Promise<User | null> {
    try {
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string };
      
      const authToken = await this.authTokenModel.findByToken(token);
      if (!authToken || new Date(authToken.expiresAt) < new Date()) {
        return null;
      }

      const user = await this.userModel.findById(decoded.userId);
      return user && user.isActive ? user : null;
    } catch (error) {
      return null;
    }
  }

  public async createUser(createUserRequest: CreateUserRequest): Promise<Omit<User, 'password'>> {
    const { username, email, password, roles = [] } = createUserRequest;

    const existingUserByUsername = await this.userModel.existsByUsername(username);
    if (existingUserByUsername) {
      throw new Error('用户名已存在');
    }

    const existingUserByEmail = await this.userModel.existsByEmail(email);
    if (existingUserByEmail) {
      throw new Error('邮箱已存在');
    }

    if (roles.length > 0) {
      const roleModel = new RoleModel();
      for (const roleId of roles) {
        const role = await roleModel.findById(roleId);
        if (!role) {
          throw new Error(`角色 ID ${roleId} 不存在`);
        }
      }
    }

    const hashedPassword = await bcrypt.hash(password, config.bcryptRounds);
    
    const user = await this.userModel.create({
      username,
      email,
      password: hashedPassword,
      roles,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public async updateUser(id: string, updates: UpdateUserRequest): Promise<Omit<User, 'password'> | null> {
    const existingUser = await this.userModel.findById(id);
    if (!existingUser) {
      throw new Error('用户不存在');
    }

    if (updates.username && updates.username !== existingUser.username) {
      const existingUserByUsername = await this.userModel.existsByUsername(updates.username);
      if (existingUserByUsername) {
        throw new Error('用户名已存在');
      }
    }

    if (updates.email && updates.email !== existingUser.email) {
      const existingUserByEmail = await this.userModel.existsByEmail(updates.email);
      if (existingUserByEmail) {
        throw new Error('邮箱已存在');
      }
    }

    if (updates.roles) {
      const roleModel = new RoleModel();
      for (const roleId of updates.roles) {
        const role = await roleModel.findById(roleId);
        if (!role) {
          throw new Error(`角色 ID ${roleId} 不存在`);
        }
      }
    }

    const updatedUser = await this.userModel.update(id, updates);
    if (!updatedUser) {
      return null;
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }

  public async changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new Error('用户不存在');
    }

    const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new Error('原密码错误');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, config.bcryptRounds);
    await this.userModel.update(id, { password: hashedNewPassword });
    
    await this.authTokenModel.deleteByUserId(id);
  }

  public async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userModel.findAll();
    return users.map(user => {
      const { password: _, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  public async getUserById(id: string): Promise<Omit<User, 'password'> | null> {
    const user = await this.userModel.findById(id);
    if (!user) {
      return null;
    }
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public async deleteUser(id: string): Promise<boolean> {
    await this.authTokenModel.deleteByUserId(id);
    return await this.userModel.delete(id);
  }

  private parseExpiresIn(expiresIn: string): number {
    const time = parseInt(expiresIn.replace(/[^0-9]/g, ''));
    const unit = expiresIn.replace(/[0-9]/g, '');
    
    switch (unit) {
      case 's': return time;
      case 'm': return time * 60;
      case 'h': return time * 60 * 60;
      case 'd': return time * 60 * 60 * 24;
      default: return time;
    }
  }
}