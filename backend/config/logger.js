import pino from 'pino';
import path from 'path';
import fs from 'fs';

// Ensure logs directory exists
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const isDevelopment = process.env.NODE_ENV === 'development';

const transport = pino.transport({
  targets: [
    // 1. Log errors to error.log
    {
      target: 'pino/file',
      level: 'error',
      options: { 
        destination: path.join(logDir, 'error.log'),
        mkdir: true 
      }
    },
    // 2. Log everything to combined.log
    {
      target: 'pino/file',
      level: 'info',
      options: { 
        destination: path.join(logDir, 'combined.log'),
        mkdir: true 
      }
    },
    // 3. Pretty print to console in development
    {
      target: 'pino-pretty',
      level: 'info',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
      }
    }
  ]
});

const logger = pino(
  {
    level: process.env.LOG_LEVEL || 'info',
  },
  transport
);

export default logger;
