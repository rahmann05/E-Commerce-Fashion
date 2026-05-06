import app from './src/app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`API Gateway v2.1.0 running on http://localhost:${env.PORT}`);
  console.log(`Commerce Service: ${env.COMMERCE_SERVICE_URL}`);
  console.log(`Admin Service: ${env.ADMIN_SERVICE_URL}`);
  console.log(`Customer Service: ${env.CUSTOMER_SERVICE_URL}`);
});
