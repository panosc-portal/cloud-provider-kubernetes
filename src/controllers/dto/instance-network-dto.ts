import { model, property } from '@loopback/repository';
import { InstanceProtocol } from '../../models';

@model()
export class InstanceNetworkDto {
  @property({
    type: 'string'
  })
  hostname: string;

  @property({
    type: 'array',
    itemType: 'object'
  })
  protocols: InstanceProtocol[];

  constructor(data?: Partial<InstanceNetworkDto>) {
    Object.assign(this, data);
  }
}
