import { env } from './config/env';
import app from "./app";

app.listen(env.PORT, () => {
  console.log(`Commerce Service listening on port ${env.PORT}`);
});
