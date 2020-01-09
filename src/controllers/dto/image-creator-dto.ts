import { model, property } from '@loopback/repository';
import { ImageProtocolCreatorDto } from './image-protocol-creator-dto';

@model()
export class ImageCreatorDto {
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
    type: 'string',
  })
  command: string;

  @property({
    type: 'string',
  })
  args: string;

  @property({
    type: 'string'
  })
  description?: string;

  @property({ type: 'array', itemType: 'object' })
  protocols: ImageProtocolCreatorDto[];

  constructor(data?: Partial<ImageCreatorDto>) {
    Object.assign(this, data);
  }
}
