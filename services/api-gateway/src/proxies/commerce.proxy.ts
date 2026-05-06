import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../../config/env';
import { proxyOptions } from './common.proxy';

export const commerceProxy = createProxyMiddleware({
  ...proxyOptions(env.COMMERCE_SERVICE_URL),
  pathRewrite: { '^/api/storefront': '/api' }
});

export const commerceAdminProxy = createProxyMiddleware({
  ...proxyOptions(env.COMMERCE_SERVICE_URL),
  pathRewrite: { '^/api/admin/storefront': '/api/admin' }
});
