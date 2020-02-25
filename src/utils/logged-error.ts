import { logger } from "./logger";

export class LoggedError extends Error {

  constructor(message: string) {
    super(message);
    logger.error(message);
  }
}