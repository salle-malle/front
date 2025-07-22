module.exports = {
  apps: [
    {
      name: 'salle-malle-front',
      script: 'npm',
      args: 'start',
      cwd: '/var/www/salle-malle-front',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        NEXT_PUBLIC_BACK_API_URL: 'http://localhost:8080/api/v1',
        ALPHA_VANTAGE_API_KEY: 'LHH7HC2OX2G9FMU2',
        PORT: 3000
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000
      },
      error_file: '/var/log/salle-malle-front/err.log',
      out_file: '/var/log/salle-malle-front/out.log',
      log_file: '/var/log/salle-malle-front/combined.log',
      time: true
    }
  ]
}; 