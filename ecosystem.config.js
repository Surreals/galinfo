module.exports = {
  apps: [
    {
      name: 'nextjs',
      script: 'npm',
      args: 'start',
      cwd: '/root/galinfo/galinfo', 
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        DB_HOST: 'localhost',
        DB_USER: 'appuser',
        DB_PASSWORD: 'STRONG_PASS_HERE',
        DB_NAME: 'galinfodb_db',
        DB_PORT: 3006
      }
    }
  ]
};
