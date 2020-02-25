import { model, property } from '@loopback/repository';

@model()
export class InstanceUpdatorDto {
  @property({
    type: 'number',
    required: true,
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

  constructor(data?: Partial<InstanceUpdatorDto>) {
    Object.assign(this, data);
  }
}
