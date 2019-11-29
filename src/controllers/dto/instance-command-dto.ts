import { model, property } from '@loopback/repository';
import { InstanceCommandType } from '../../models';

@model()
export class InstanceCommandDto {
  @property({
    type: 'string',
    required: true
  })
  type: InstanceCommandType;

  constructor(data?: Partial<InstanceCommandDto>) {
    Object.assign(this, data);
  }
}
