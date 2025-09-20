module.exports = {
  apps: [{
    name: 'legalease-ai',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 7000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 7000
    },
    error_file: './server/logs/err.log',
    out_file: './server/logs/out.log',
    log_file: './server/logs/combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=4096',
    watch: false,
    ignore_watch: ['node_modules', 'server/logs'],
    restart_delay: 4000,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
