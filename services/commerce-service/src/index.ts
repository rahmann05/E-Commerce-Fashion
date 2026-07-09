import { env } from './config/env';
import app from "./app";

const port = process.env.PORT || env.PORT;
app.listen(port as number, "0.0.0.0", () => {
  console.log(`Commerce Service listening on port ${port}`);
});
