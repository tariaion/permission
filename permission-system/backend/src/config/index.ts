export interface AppConfig {
  port: number;
  nodeEnv: string;
  jwtSecret: string;
  jwtExpiresIn: string;
  corsOrigin: string[];
  bcryptRounds: number;
  dataDir: string;
}

export const config: AppConfig = {
  port: parseInt(process.env.DEPLOY_RUN_PORT || process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  corsOrigin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10),
  dataDir: process.env.DATA_DIR || './data',
};