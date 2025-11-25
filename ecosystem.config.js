module.exports = {
  apps: [
    {
      name: 'friend-backend',
      script: 'server.js',
      cwd: './backend',
      watch: true,
      env: {
        NODE_ENV: 'development'
      }
    },
    {
      name: 'friend-frontend',
      // Use npm start for the CRA dev server to preserve hot reload
      script: 'npm',
      args: 'start',
      cwd: './frontend',
      watch: false,
      env: {
        NODE_ENV: 'development',
        PORT: 3000
      }
    }
  ]
};
