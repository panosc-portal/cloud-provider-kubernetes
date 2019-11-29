import { Instance } from './instance.model';
import { InstanceCommandType } from '../enumerations';

export class InstanceCommand {
  get instance(): Instance {
    return this._instance;
  }

  get type(): InstanceCommandType {
    return this._type;
  }

  constructor(private _instance: Instance, private _type: InstanceCommandType) {}
}
