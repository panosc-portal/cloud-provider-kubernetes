import { createLogger, format, transports } from 'winston';

export const buildLogger = function(prefix?: string, fgColor?: number) {
  const escStart = fgColor ? `\u001b[38;5;${fgColor}m` : '';
  const escEnd = fgColor ? `\u001b[0m` : '';
  return createLogger({
    level: process.env.CLOUD_PROVIDER_K8S_LOG_LEVEL,
    transports: [
      new transports.Console({
        format: fgColor ? format.combine(
          format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
          }),
          format.printf(info => {
            return `${escStart}${info.timestamp} ${info.level}: ${prefix ? prefix + ' ' : ''}${info.message}${escEnd}`;
          })
        ) : format.combine(
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
