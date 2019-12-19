import { model, property } from '@loopback/repository';

@model()
export class FlavourCreatorDto {
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

  constructor(data?: Partial<FlavourCreatorDto>) {
    Object.assign(this, data);
  }
}
