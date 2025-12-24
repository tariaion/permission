import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../hooks/usePermissions';
import { RouteConfig } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  requireAuth?: boolean;
  fallback?: React.ReactNode;
}

/**
 * 受保护的路由组件
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = [],
  requireAuth = true,
  fallback = <div>访问被拒绝</div>
}) => {
  const { isAuthenticated, loading } = useAuth();
  const { canAccessRoute } = usePermissions();
  const location = useLocation();

  // 检查认证状态
  if (loading) {
    return <div>加载中...</div>;
  }

  if (requireAuth && !isAuthenticated) {
    // 保存当前路径，登录后重定向回来
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查权限
  if (requiredPermissions.length > 0 && !canAccessRoute(requiredPermissions)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * 路由权限检查Hook
 */
export const useRoutePermissions = (routes: RouteConfig[]) => {
  const { canAccessRoute } = usePermissions();

  /**
   * 过滤用户有权限访问的路由
   */
  const getAccessibleRoutes = (routes: RouteConfig[]): RouteConfig[] => {
    return routes.reduce<RouteConfig[]>((acc, route) => {
      // 检查当前路由权限
      if (canAccessRoute(route.requiredPermissions || [])) {
        const accessibleRoute = { ...route };

        // 递归检查子路由
        if (route.children && route.children.length > 0) {
          const accessibleChildren = getAccessibleRoutes(route.children);
          if (accessibleChildren.length > 0) {
            accessibleRoute.children = accessibleChildren;
          }
        }

        // 如果路由或其子路由有权限，则添加到结果中
        if (!route.children || accessibleRoute.children!.length > 0 || !route.requiredPermissions || route.requiredPermissions.length === 0) {
          acc.push(accessibleRoute);
        }
      }

      return acc;
    }, []);
  };

  /**
   * 检查特定路由是否可访问
   */
  const isRouteAccessible = (path: string): boolean => {
    const findRoute = (routes: RouteConfig[], targetPath: string): RouteConfig | null => {
      for (const route of routes) {
        if (route.path === targetPath) {
          return route;
        }
        if (route.children) {
          const found = findRoute(route.children, targetPath);
          if (found) return found;
        }
      }
      return null;
    };

    const route = findRoute(routes, path);
    if (!route) return false;

    return canAccessRoute(route.requiredPermissions || []);
  };

  /**
   * 生成菜单项（过滤无权限的菜单）
   */
  const getMenuItems = (routes: RouteConfig[]) => {
    return getAccessibleRoutes(routes).filter(route => !route.hideInMenu);
  };

  return {
    getAccessibleRoutes,
    isRouteAccessible,
    getMenuItems
  };
};

/**
 * 动态路由组件
 */
export const DynamicRoute: React.FC<{
  routes: RouteConfig[];
}> = ({ routes }) => {
  const { getAccessibleRoutes } = useRoutePermissions(routes);
  const accessibleRoutes = getAccessibleRoutes(routes);

  return (
    <>
      {accessibleRoutes.map((route) => (
        <React.Fragment key={route.path}>
          {React.createElement(route.component)}
        </React.Fragment>
      ))}
    </>
  );
};

export default ProtectedRoute;