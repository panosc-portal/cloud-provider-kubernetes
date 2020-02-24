import { logger } from '../../utils';

export abstract class Job {
  private _running = false;

  constructor() {}

  run(name: string, params?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      if (this._running) {
        logger.debug(`Job '${name}' is already running`);
        resolve(null);
      } else {
        this._running = true;
        this._execute(params)
          .then((value: any) => {
            this._running = false;
            resolve(value);
          })
          .catch(error => {
            this._running = false;
            logger.error(`Caught an error while running job '${name}': ${error.message}`);
            reject(error);
          });
      }
    });
  }

  protected abstract _execute(params?: any): Promise<any>;
}
