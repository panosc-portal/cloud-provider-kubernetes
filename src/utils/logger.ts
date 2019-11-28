import { createLogger, format, transports } from 'winston';

export const buildLogger = function(prefix?: string) {
  return createLogger({
    level: process.env.CLOUD_PROVIDER_K8S_LOG_LEVEL,
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
          }),
          format.printf(info => {
            return `${info.timestamp} ${info.level}: ${prefix ? prefix + ' ' : ''}${info.message}`;
          })
        )
      })
    ]
  });
};

export const logger = buildLogger();
