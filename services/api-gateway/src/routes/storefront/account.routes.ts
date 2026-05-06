import { Router } from 'express';
import { customerProxy } from '../../proxies/admin.proxy';
import { authenticateJWT } from '../../middlewares/auth';
import { validate } from '../../middlewares/validate';
import { AddAddressSchema, AddPaymentMethodSchema } from '@novure/contracts';
import Joi from 'joi';

const router = Router();

router.use(authenticateJWT);

router.get('/profile', customerProxy);

// Conditional validation for account actions
const AccountActionSchema = Joi.object({
  action: Joi.string().valid('addAddress', 'updateAddress', 'removeAddress', 'addPaymentMethod', 'removePaymentMethod', 'createOrder').required()
}).unknown(true);

router.post('/', validate(AccountActionSchema), customerProxy);

export default router;
