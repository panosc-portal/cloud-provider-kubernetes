import {bind, BindingScope} from '@loopback/core';
import { Metrics} from '../models';

@bind({scope: BindingScope.SINGLETON})
export class MetricsService {
  constructor() {}

  getMetrics(): Promise<Metrics> {
    return new Promise<Metrics>(function(resolve, reject) {
      resolve();
    });
  };

}
