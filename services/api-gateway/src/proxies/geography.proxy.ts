import { createProxyMiddleware } from 'http-proxy-middleware';

export const geographyProxy = createProxyMiddleware({
  target: 'https://www.emsifa.com',
  changeOrigin: true,
  pathRewrite: { '^/api/geography': '/api-wilayah-indonesia/api' }
});
