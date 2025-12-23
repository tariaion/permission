import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export const validateRequest = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      res.status(400).json({
        success: false,
        error: '请求参数验证失败',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
        })),
      });
      return;
    }
    
    next();
  };
};

export const loginSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  password: Joi.string().required().min(6),
});

export const createUserSchema = Joi.object({
  username: Joi.string().required().min(3).max(50),
  email: Joi.string().required().email(),
  password: Joi.string().required().min(6),
  roles: Joi.array().items(Joi.string()).optional(),
});

export const updateUserSchema = Joi.object({
  username: Joi.string().optional().min(3).max(50),
  email: Joi.string().optional().email(),
  roles: Joi.array().items(Joi.string()).optional(),
  isActive: Joi.boolean().optional(),
}).min(1);

export const createRoleSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  description: Joi.string().required().max(200),
  permissions: Joi.array().items(Joi.string()).optional(),
});

export const updateRoleSchema = Joi.object({
  name: Joi.string().optional().min(2).max(50),
  description: Joi.string().optional().max(200),
  permissions: Joi.array().items(Joi.string()).optional(),
}).min(1);

export const createPermissionSchema = Joi.object({
  name: Joi.string().required().min(2).max(100),
  resource: Joi.string().required().min(2).max(50),
  action: Joi.string().required().min(2).max(50),
  description: Joi.string().required().max(200),
});

export const updatePermissionSchema = Joi.object({
  name: Joi.string().optional().min(2).max(100),
  resource: Joi.string().optional().min(2).max(50),
  action: Joi.string().optional().min(2).max(50),
  description: Joi.string().optional().max(200),
}).min(1);

export const changePasswordSchema = Joi.object({
  oldPassword: Joi.string().required().min(6),
  newPassword: Joi.string().required().min(6),
});