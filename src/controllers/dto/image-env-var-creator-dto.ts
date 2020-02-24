import { model, property } from '@loopback/repository';

@model()
export class ImageEnvVarCreatorDto {
  @property({
    type: 'string'
  })
  name: string;

  @property({
    type: 'string'
  })
  value: string;

  constructor(data?: Partial<ImageEnvVarCreatorDto>) {
    Object.assign(this, data);
  }
}
