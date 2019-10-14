import {bind, /* inject, */ BindingScope} from '@loopback/core';
import {Info} from '../models';

@bind({scope: BindingScope.SINGLETON})
export class InfoService {
  constructor(/* Add @inject to inject parameters */) {}

  getInfo(): Promise<Info> {
    return new Promise<Info>(function(resolve, reject) {
      resolve();
    });
  };

}
