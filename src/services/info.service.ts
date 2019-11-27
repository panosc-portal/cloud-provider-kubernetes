import {bind, BindingScope} from '@loopback/core';
import {Info} from '../models';

@bind({scope: BindingScope.SINGLETON})
export class InfoService {
  constructor() {}

  getInfo(): Promise<Info> {
    return new Promise<Info>(function(resolve, reject) {
      resolve();
    });
  };

}
