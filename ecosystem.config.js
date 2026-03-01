/**
 * PM2 ecosystem config — tracx.biznesjon.uz production
 *
 * Usage:
 *   pm2 start ecosystem.config.js --env production
 *   pm2 save
 *   pm2 startup   <- run once to enable auto-start on reboot
 */

module.exports = {
  apps: [
    {
      name: 'tracx-server',
      script: './server/src/server.js',
      cwd: '/var/www/tracx',

      // Cluster mode for multi-core utilization
      instances: 'max',
      exec_mode: 'cluster',

      // Restart policy
      watch: false,
      max_memory_restart: '512M',
      restart_delay: 3000,
      max_restarts: 10,
      min_uptime: '10s',

      // Logs
      error_file:      '/var/log/tracx/server-err.log',
      out_file:        '/var/log/tracx/server-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs:      true,

      // Environment variables
      env: {
        NODE_ENV: 'development',
        PORT: 5001,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5001,
      },
    },
  ],
};
