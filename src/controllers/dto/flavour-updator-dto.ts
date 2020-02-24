import { model, property } from '@loopback/repository';

@model()
export class FlavourUpdatorDto {
  @property({
    type: 'number',
    required: true
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
    type: 'number',
    required: true
  })
  cpu: number;

  @property({
    type: 'number',
    required: true
  })
  memory: number;

  constructor(data?: Partial<FlavourUpdatorDto>) {
    Object.assign(this, data);
  }
}
