import { Config } from './types';
import development from './environments/development';
import production from './environments/production';

const env = process.env.NODE_ENV || 'development';

const configs: { [key: string]: Config } = {
  development,
  production
};

const config = configs[env];

if (!config) {
  throw new Error(`No configuration found for environment: ${env}`);
}

export default config; 