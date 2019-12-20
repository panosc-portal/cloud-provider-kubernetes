import { bind, BindingScope } from '@loopback/core';
import { Info } from '../models';
const packageJson = require('../../package.json');

@bind({ scope: BindingScope.SINGLETON })
export class InfoService {
  constructor() {}

  getInfo(): Promise<Info> {
    return new Promise<Info>(function(resolve, reject) {
      resolve(new Info({
        name: packageJson. name,
        version: packageJson.version
      }));
    });
  }
}
