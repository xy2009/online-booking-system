import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';

const logLevel = process.env.LOG_LEVEL || 'info';

// 日志目录结构 logs/YYYY-MM-DD/app-%DATE%-%INDEX%.log
const logDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const dailyRotateTransport = new DailyRotateFile({
  dirname: logDir,
  filename: '%DATE%/app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  zippedArchive: false,
  maxSize: '10m', // 单文件最大10MB
  maxFiles: '30d', // 最多保留30天
  level: 'info',
  auditFile: path.join(logDir, '.audit.json'),
});

export const logger = winston.createLogger({
  level: logLevel,
  
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      return `[${timestamp}] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `[${timestamp}] [${level}] ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      )
    }),
    dailyRotateTransport
  ]
});