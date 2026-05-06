import { Router } from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { env } from '../../config/env';
import { proxyOptions } from '../../proxies/common.proxy';
import { commerceProxy } from '../../proxies/commerce.proxy';

const router = Router();

const customerShippingProxy = createProxyMiddleware({
	...proxyOptions(env.CUSTOMER_SERVICE_URL),
	pathRewrite: { '^/track': '/shipping/track' }
});

router.post('/calculate', commerceProxy);
router.get('/track/:orderId', customerShippingProxy);

export default router;
