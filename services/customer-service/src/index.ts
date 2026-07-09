import { env } from './config/env.js';
import app from './app.js';

const port = process.env.PORT || env.PORT;
app.listen(port as number, "0.0.0.0", () => {
  console.log(`Customer Service listening on port ${port}`);
});
