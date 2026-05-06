import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../../config/env';
import { proxyOptions } from './common.proxy';

export const adminProxy = createProxyMiddleware({
  ...proxyOptions(env.ADMIN_SERVICE_URL)
});

export const adminAuthProxy = createProxyMiddleware({
  ...proxyOptions(env.ADMIN_SERVICE_URL),
  pathRewrite: { '^/api/admin/auth': '/api/admin/management/auth' }
});

export const adminManagementProxy = createProxyMiddleware({
  ...proxyOptions(env.ADMIN_SERVICE_URL),
  pathRewrite: { '^/api/admin/shipping': '/api/admin/management/shipping' }
});

export const customerProxy = createProxyMiddleware({
  ...proxyOptions(env.CUSTOMER_SERVICE_URL)
});
