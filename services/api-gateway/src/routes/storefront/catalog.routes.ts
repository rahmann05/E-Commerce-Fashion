import { Router } from 'express';
import { commerceProxy } from '../../proxies/commerce.proxy';

const router = Router();

// Products & Categories are public
router.use('/products', commerceProxy);
router.use('/categories', commerceProxy);

export default router;
