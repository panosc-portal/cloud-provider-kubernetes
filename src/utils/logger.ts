import {createLogger, format, transports} from 'winston';

export const logger = createLogger({
    level: process.env.CLOUD_PROVIDER_K8S_LOG_LEVEL,
    transports: [
      new transports.Console({
        format: format.combine(
          format.colorize(),
          format.simple()
        )
      })
    ]
  });

