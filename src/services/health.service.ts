import { bind, BindingScope } from '@loopback/core';
import { Health } from '../models/enumerations';

@bind({ scope: BindingScope.SINGLETON })
export class HealthService {
  constructor() {}

  getHealth(): Promise<Health> {
    return new Promise<Health>(function(resolve, reject) {
      resolve();
    });
  }
}
