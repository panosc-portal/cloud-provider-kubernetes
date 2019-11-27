import {model, property} from '@loopback/repository';
import { InstanceStatus } from '../enumerations/InstanceStatus';

@model()
export class InstanceState {
  @property({
    type: 'string',
    required: true,
  })
  status: InstanceStatus;

  @property({
    type: 'number',
    required: true,
  })
  cpu: number;

  @property({
    type: 'number',
    required: true,
  })
  memory: number;

  constructor(data?: Partial<InstanceState>) {
    Object.assign(this, data);
  }
}
