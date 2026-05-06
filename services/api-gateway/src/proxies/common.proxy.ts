import { fixRequestBody } from 'http-proxy-middleware';

export const proxyOptions = (target: string) => ({
  target,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq: any, req: any) => {
      fixRequestBody(proxyReq, req);
      
      // Forward cookies
      if (req.headers.cookie) {
        proxyReq.setHeader('cookie', req.headers.cookie);
      }

      // Forward x-internal-key if it was already validated or passed
      if (req.headers['x-internal-key']) {
        proxyReq.setHeader('x-internal-key', req.headers['x-internal-key']);
      }

      // Forward user ID if decoded from JWT
      if (req.user && req.user.id) {
        proxyReq.setHeader('x-user-id', req.user.id);
      }
      
      if (req.user && req.user.role) {
        proxyReq.setHeader('x-user-role', req.user.role);
      }
    },
    proxyRes: (proxyRes: any, req: any, res: any) => {
      const sc = proxyRes.headers['set-cookie'];
      if (sc) {
        res.setHeader('set-cookie', sc);
      }
    },
    error: (err: any, req: any, res: any) => {
      console.error(`[Proxy Error] ${req.method} ${req.url}:`, err.message);
      res.status(502).json({
        success: false,
        error: 'Backend service connection error'
      });
    }
  }
});
