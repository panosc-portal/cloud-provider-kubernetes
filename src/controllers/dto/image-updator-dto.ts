import { model, property } from '@loopback/repository';
import { ImageProtocolCreatorDto } from './image-protocol-creator-dto';

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
    required: true
  })
  repository?: string;

  @property({
    type: 'string',
    required: true
  })
  path: string;

  @property({
    type: 'string',
  })
  command?: string;

  @property({
    type: 'string',
  })
  args?: string;

  @property({
    type: 'string'
  })
  description?: string;

  @property({ type: 'array', itemType: ImageProtocolCreatorDto })
  protocols: ImageProtocolCreatorDto[];

  constructor(data?: Partial<ImageUpdatorDto>) {
    Object.assign(this, data);
  }
}
