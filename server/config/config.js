/* Set NODE_ENV to be 'development" by default. */
const env = process.env.NODE_ENV || 'development';

if (env === 'test' || env === 'development') {
  const config = require('./config.json');
  envConfig = config[env];

  Object.keys(envConfig).forEach((key) => {
    process.env[key] = envConfig[key];
  })
}
