import express from 'express';
import cors from 'cors';
import { env } from '../config/env';

import storefrontCatalogRoutes from './storefront/catalog.routes';
import storefrontAuthRoutes from './storefront/auth.routes';
import storefrontCartRoutes from './storefront/cart.routes';
import storefrontCheckoutRoutes from './storefront/checkout.routes';

import adminProductsRoutes from './admin/products.routes';
import adminOrdersRoutes from './admin/orders.routes';
import adminUsersRoutes from './admin/users.routes';
import adminManagementRoutes from './admin/management.routes';

import { geographyProxy } from '../proxies/geography.proxy';
import { customerProxy } from '../proxies/admin.proxy';

const router = express.Router();

// 1. Geography API
router.use('/geography', geographyProxy);

// 2. Storefront BFF
router.use('/storefront/auth', storefrontAuthRoutes);
router.use('/storefront/cart', storefrontCartRoutes);
router.use('/storefront/checkout', storefrontCheckoutRoutes);
router.use('/storefront/orders', storefrontCheckoutRoutes); // Reuse for orders
router.use('/storefront/shipping', customerProxy);
router.use('/storefront', storefrontCatalogRoutes); // Generic storefront (products/categories)

// 3. Admin BFF
router.use('/admin/auth', adminUsersRoutes);
router.use('/admin/storefront/orders', adminOrdersRoutes);
router.use('/admin/storefront/analytics', adminOrdersRoutes); // Often handled by same controller
router.use('/admin/storefront', adminProductsRoutes);
router.use('/admin/management', adminManagementRoutes);

export default router;
