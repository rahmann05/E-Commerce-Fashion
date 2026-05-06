import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../../config/env';
import { proxyOptions } from './common.proxy';

export const adminProxy = createProxyMiddleware({
  ...proxyOptions(env.ADMIN_SERVICE_URL)
});

export const customerProxy = createProxyMiddleware({
  ...proxyOptions(env.CUSTOMER_SERVICE_URL)
});
