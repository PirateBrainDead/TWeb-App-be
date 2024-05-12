import * as dotenv from 'dotenv';
import * as process from 'process';

dotenv.config();

export const defaultConfig = {
  app: {
    env: process.env.NODE_ENV,
    port: parseInt(process.env.PORT, 10),
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
  jwt: {
    scheme: 'Bearer',
    secret: process.env.JWT_SECRET,
    expiresIn: '9999 years',
  },
};

export default () => defaultConfig;
