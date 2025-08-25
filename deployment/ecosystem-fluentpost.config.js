module.exports = {
  apps: [
    {
      name: 'fluentpost',
      script: 'node_modules/.bin/next',
      args: 'start -p 3002',
      cwd: '/home/fluentpost',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOSTNAME: '0.0.0.0'
      },
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '1G',
      error_file: '/home/fluentpost/logs/err.log',
      out_file: '/home/fluentpost/logs/out.log',
      log_file: '/home/fluentpost/logs/combined.log',
      time: true,
      autorestart: true,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ]
}
