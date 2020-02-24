import { model, property } from '@loopback/repository';
import { ImageProtocolCreatorDto } from './image-protocol-creator-dto';
import { ImageVolumeCreatorDto } from './image-volume-creator-dto';
import { ImageEnvVarCreatorDto } from './image-env-var-creator-dto';

@model()
export class ImageCreatorDto {
  @property({
    type: 'string',
    required: true
  })
  name: string;

  @property({
    type: 'string'
  })
  repository?: string;

  @property({
    type: 'string',
    required: true
  })
  path: string;

  @property({
    type: 'string'
  })
  command?: string;

  @property({
    type: 'string'
  })
  args?: string;

  @property({
    type: 'number'
  })
  runAsUID?: number;

  @property({
    type: 'string'
  })
  description?: string;

  @property({ type: 'array', itemType: ImageProtocolCreatorDto })
  protocols: ImageProtocolCreatorDto[];

  @property({ type: 'array', itemType: ImageVolumeCreatorDto })
  volumes: ImageVolumeCreatorDto[];

  @property({ type: 'array', itemType: ImageEnvVarCreatorDto })
  envVars: ImageEnvVarCreatorDto[];

  constructor(data?: Partial<ImageCreatorDto>) {
    Object.assign(this, data);
  }
}
