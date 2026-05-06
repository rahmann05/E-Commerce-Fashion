import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 4002;

app.listen(PORT, () => {
  console.log(`Customer Service listening on port ${PORT}`);
});
