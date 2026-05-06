import { Router } from 'express';
import { commerceAdminProxy } from '../../proxies/commerce.proxy';
import { authenticateJWT } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { CreateProductSchema, CreateCategorySchema } from '@novure/contracts';

const router = Router();

// Products
router.get('/products', authenticateJWT, commerceAdminProxy);
router.post('/products', authenticateJWT, validate(CreateProductSchema), commerceAdminProxy);
router.get('/products/:id', authenticateJWT, commerceAdminProxy);
router.patch('/products/:id', authenticateJWT, commerceAdminProxy);
router.delete('/products/:id', authenticateJWT, commerceAdminProxy);

// Categories
router.get('/categories', authenticateJWT, commerceAdminProxy);
router.post('/categories', authenticateJWT, validate(CreateCategorySchema), commerceAdminProxy);
router.get('/categories/:id', authenticateJWT, commerceAdminProxy);
router.patch('/categories/:id', authenticateJWT, commerceAdminProxy);
router.delete('/categories/:id', authenticateJWT, commerceAdminProxy);

// Uploads
router.post('/uploads', authenticateJWT, commerceAdminProxy);

export default router;
