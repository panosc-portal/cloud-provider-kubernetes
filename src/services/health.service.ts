import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {Health} from '../models/enumerations/Health';

@bind({scope: BindingScope.SINGLETON})
export class HealthService {
  constructor(/* Add @inject to inject parameters */) {
  }

  getHealth(): Promise<Health> {
    return new Promise<Health>(function(resolve, reject) {
      resolve();
    });
  };


}