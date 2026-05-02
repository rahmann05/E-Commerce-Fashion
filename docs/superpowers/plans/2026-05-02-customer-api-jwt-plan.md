# Customer API Service & Global JWT Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Create a new Express.js microservice (`customer-api-service`) to handle storefront data without CSRF/cookie issues, and migrate the entire system to a unified JWT authentication model.

**Architecture:** A lightweight Express.js server mapping directly to the Neon database via Prisma. The API Gateway will be rerouted to point Storefront traffic here. Both this new service and the existing `admin-service` will generate and validate standard JWTs for stateless authentication.

**Tech Stack:** Node.js, Express.js, TypeScript, Prisma, jsonwebtoken, bcryptjs, cors.

---

### Task 1: Scaffolding the New Customer API Service

**Files:**
- Create: `services/customer-api-service/package.json`
- Create: `services/customer-api-service/tsconfig.json`
- Create: `services/customer-api-service/Dockerfile`
- Create: `services/customer-api-service/src/index.ts`

- [ ] **Step 1: Initialize package.json**
Run: `mkdir -p services/customer-api-service/src && cd services/customer-api-service && npm init -y`

- [ ] **Step 2: Install dependencies**
Run: `cd services/customer-api-service && npm install express cors dotenv jsonwebtoken bcryptjs pg @prisma/client && npm install -D typescript @types/express @types/cors @types/node @types/jsonwebtoken @types/bcryptjs ts-node prisma`

- [ ] **Step 3: Create tsconfig.json**
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "CommonJS",
    "rootDir": "./src",
    "outDir": "./dist",
    "esModuleInterop": true,
    "strict": true,
    "skipLibCheck": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"]
}
```

- [ ] **Step 4: Create minimal Express server (`src/index.ts`)**
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'UP', service: 'customer-api-service' });
});

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => {
  console.log(`🚀 Customer API Service running on port ${PORT}`);
});
```

- [ ] **Step 5: Create Dockerfile**
```dockerfile
FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npx prisma generate
RUN npx tsc
EXPOSE 4002
CMD ["node", "dist/index.js"]
```

- [ ] **Step 6: Commit**
`git add services/customer-api-service`
`git commit -m "feat: scaffold customer-api-service"`

---

### Task 2: Prisma Integration for Customer API

**Files:**
- Copy: `services/admin-service/prisma/schema.prisma` -> `services/customer-api-service/prisma/schema.prisma`
- Create: `services/customer-api-service/src/infrastructure/prisma.ts`

- [ ] **Step 1: Copy Schema**
Run: `cp -r services/admin-service/prisma services/customer-api-service/`
(Ensure the `DATABASE_URL` connects to the Neon DB).

- [ ] **Step 2: Generate Prisma Client**
Run: `cd services/customer-api-service && npx prisma generate`

- [ ] **Step 3: Create Prisma Client Instance (`src/infrastructure/prisma.ts`)**
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

let connectionString = process.env.DATABASE_URL || '';
if (!connectionString.includes('sslmode=')) {
  const separator = connectionString.includes('?') ? '&' : '?';
  connectionString += `${separator}sslmode=no-verify`;
} else if (connectionString.includes('sslmode=require')) {
  connectionString = connectionString.replace('sslmode=require', 'sslmode=no-verify');
}

const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
export const prisma = new PrismaClient({ adapter });
```

- [ ] **Step 4: Commit**
`git add services/customer-api-service/prisma services/customer-api-service/src/infrastructure`
`git commit -m "feat(customer-api): integrate prisma for neon db"`

---

### Task 3: JWT Middleware & Auth Endpoints (Customer API)

**Files:**
- Create: `services/customer-api-service/src/middleware/auth.ts`
- Create: `services/customer-api-service/src/routes/auth.ts`
- Modify: `services/customer-api-service/src/index.ts`

- [ ] **Step 1: Create JWT Middleware (`src/middleware/auth.ts`)**
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'novure-super-secret-key-2026';

export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) return res.status(403).json({ success: false, error: 'Invalid token' });
      req.user = decoded as { id: string; role: string };
      next();
    });
  } else {
    res.status(401).json({ success: false, error: 'Unauthorized' });
  }
}

export function generateToken(userId: string, role: string): string {
  return jwt.sign({ id: userId, role }, JWT_SECRET, { expiresIn: '7d' });
}
```

- [ ] **Step 2: Create Auth Routes (`src/routes/auth.ts`)**
```typescript
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../infrastructure/prisma';
import { generateToken, authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const customer = await prisma.customer.findUnique({ where: { email } });
  
  if (!customer || !bcrypt.compareSync(password, customer.password)) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }
  
  const token = generateToken(customer.id, 'CUSTOMER');
  const { password: _, ...customerData } = customer;
  res.json({ success: true, data: customerData, token });
});

router.post('/register', async (req, res) => {
  const { email, password, name, phone } = req.body;
  const existing = await prisma.customer.findUnique({ where: { email } });
  
  if (existing) return res.status(400).json({ success: false, message: 'Email exists' });
  
  const hashedPassword = bcrypt.hashSync(password, 10);
  const customer = await prisma.customer.create({
    data: { email, password: hashedPassword, name, phone }
  });
  
  const token = generateToken(customer.id, 'CUSTOMER');
  const { password: _, ...customerData } = customer;
  res.status(201).json({ success: true, data: customerData, token });
});

router.get('/me', authenticateJWT, async (req: AuthRequest, res) => {
  const customer = await prisma.customer.findUnique({ where: { id: req.user!.id } });
  if (!customer) return res.status(404).json({ success: false, message: 'Not found' });
  
  const { password: _, ...customerData } = customer;
  res.json({ success: true, data: customerData });
});

export default router;
```

- [ ] **Step 3: Register Routes in `index.ts`**
```typescript
// inside src/index.ts after app.use(express.json());
import authRoutes from './routes/auth';
app.use('/api/storefront/auth', authRoutes);
```

- [ ] **Step 4: Commit**
`git add services/customer-api-service/src`
`git commit -m "feat(customer-api): add jwt auth endpoints"`

---

### Task 4: Account & Cart Endpoints (Customer API)

**Files:**
- Create: `services/customer-api-service/src/routes/account.ts`
- Modify: `services/customer-api-service/src/index.ts`

- [ ] **Step 1: Create Account Routes (`src/routes/account.ts`)**
```typescript
import { Router } from 'express';
import { prisma } from '../infrastructure/prisma';
import { authenticateJWT, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateJWT);

router.get('/', async (req: AuthRequest, res) => {
  const customerId = req.user!.id;
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { addresses: true, paymentMethods: true }
  });

  if (!customer) return res.status(404).json({ success: false });

  const orders = await prisma.order.findMany({
    where: { customerId },
    include: { items: true }
  });

  res.json({
    success: true,
    data: {
      phone: customer.phone,
      addresses: customer.addresses,
      paymentMethods: customer.paymentMethods,
      orders,
      wishlist: [], vouchers: [], notifications: []
    }
  });
});

router.post('/', async (req: AuthRequest, res) => {
  const customerId = req.user!.id;
  const { action, ...body } = req.body;

  if (action === 'addAddress') {
    await prisma.address.create({ data: { ...body, isPrimary: false, customerId } });
  } else if (action === 'addPaymentMethod') {
    await prisma.paymentMethod.create({ data: { ...body, isPrimary: false, customerId } });
  }

  // Refetch
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: { addresses: true, paymentMethods: true }
  });
  
  res.json({
    success: true,
    data: {
      phone: customer?.phone,
      addresses: customer?.addresses,
      paymentMethods: customer?.paymentMethods,
      orders: [], wishlist: [], vouchers: [], notifications: []
    }
  });
});

export default router;
```

- [ ] **Step 2: Register in `index.ts`**
```typescript
import accountRoutes from './routes/account';
app.use('/api/storefront/account', accountRoutes);
```

- [ ] **Step 3: Commit**
`git add services/customer-api-service/src`
`git commit -m "feat(customer-api): add secure account endpoints"`

---

### Task 5: Reroute API Gateway & Docker Compose

**Files:**
- Modify: `docker-compose.yml`
- Modify: `services/api-gateway/index.ts`

- [ ] **Step 1: Add to `docker-compose.yml`**
Add the new service under `services:`
```yaml
  customer-api-service:
    build:
      context: ./services/customer-api-service
    ports:
      - "4002:4002"
    environment:
      - DATABASE_URL=${DATABASE_URL_NEON}
      - JWT_SECRET=novure-super-secret-key-2026
```
Inject `JWT_SECRET` into `admin-service` and `api-gateway` as well.

- [ ] **Step 2: Update API Gateway (`services/api-gateway/index.ts`)**
Change `CUSTOMER_BACKEND_URL = process.env.CUSTOMER_BACKEND_URL || 'http://customer-api-service:4002';`
Route `/api/storefront/auth`, `/account`, `/cart`, `/checkout` to `CUSTOMER_BACKEND_URL`.

- [ ] **Step 3: Commit**
`git add docker-compose.yml services/api-gateway/index.ts`
`git commit -m "chore: wire up customer-api-service to gateway"`

---

### Task 6: Storefront Next.js JWT Integration

**Files:**
- Modify: `apps/storefront-web/src/frontend/lib/auth.ts`

- [ ] **Step 1: Store Token in Cookie/LocalStorage**
Update `loginUser` to grab the `token` from the JSON response and store it securely (e.g., set an HttpOnly cookie via a Next.js API route, or simply store it in `localStorage` for now since it's an SPA approach).

Modify all `fetch` calls in `auth.ts` and `ProfileDataContext.tsx` to read the token and append:
```typescript
headers: {
  "Content-Type": "application/json",
  "Authorization": `Bearer ${localStorage.getItem('novure_jwt')}`
}
```

- [ ] **Step 2: Commit**
`git add apps/storefront-web/src/frontend`
`git commit -m "feat(storefront): integrate jwt auth headers"`