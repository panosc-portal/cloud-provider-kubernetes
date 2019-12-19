import { model, property } from '@loopback/repository';

@model()
export class ImageUpdatorDto {
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
    type: 'string',
  })
  repository: string;

  @property({
    type: 'string',
    required: true
  })
  path: string;

  @property({
    type: 'string'
  })
  description?: string;

  @property({ type: 'array', itemType: 'number' })
  protocolIds: number[];

  constructor(data?: Partial<ImageUpdatorDto>) {
    Object.assign(this, data);
  }
}
