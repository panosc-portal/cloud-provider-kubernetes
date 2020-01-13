import { model, property } from '@loopback/repository';

@model()
export class ImageVolumeCreatorDto {
  @property({
    type: 'string',
  })
  name: string;

  @property({
    type: 'string',
  })
  path: string;

  @property({
    type: 'boolean',
  })
  readOnly: boolean;

  constructor(data?: Partial<ImageVolumeCreatorDto>) {
    Object.assign(this, data);
  }
}
