import { model, property } from '@loopback/repository';
import { InstanceProtocol, Flavour, InstanceAccount, InstanceState, Image } from '../../models';

@model()
export class InstanceDto {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: true
  })
  id: number;

  @property({
    type: 'string',
    required: true
  })
  name: string;

  @property({
    type: 'string'
  })
  description?: string;

  @property({
    type: 'string',
  })
  computeId: string;

  @property({
    type: 'string',
    required: true
  })
  hostname: string;

  @property({
    type: 'date',
    required: true
  })
  createdAt: Date;

  @property({
    type: 'array',
    itemType: 'object'
  })
  protocols: InstanceProtocol[];

  @property({ type: Flavour })
  flavour: Flavour;

  @property({ type: Image })
  image: Image;

  @property({ type: InstanceAccount })
  account: InstanceAccount;

  @property({ type: InstanceState })
  state: InstanceState;

  constructor(data?: Partial<InstanceDto>) {
    Object.assign(this, data);
  }
}
