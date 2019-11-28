import { model, property } from '@loopback/repository';

@model()
export class InstanceActionDto {
  @property({
    type: 'string',
    required: true
  })
  name: string;

  constructor(data?: Partial<InstanceActionDto>) {
    Object.assign(this, data);
  }
}
