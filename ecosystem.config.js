module.exports = {
  apps: [{
    name: "salon-jardin",
    script: "dist/server.cjs",
    env: {
      NODE_ENV: "production",
    },
    instances: 1,
    exec_mode: "fork",
    watch: false,
    max_memory_restart: "500M",
    error_file: "logs/err.log",
    out_file: "logs/out.log",
    log_date_format: "YYYY-MM-DD HH:mm:ss",
    autorestart: true,
    max_restarts: 10,
    restart_delay: 5000,
  }]
};
