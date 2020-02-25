import { model, property } from '@loopback/repository';

@model()
export class ImageProtocolCreatorDto {
  @property({
    type: 'number',
  })
  port: number;

  @property({ type: 'number' })
  protocolId: number;

  constructor(data?: Partial<ImageProtocolCreatorDto>) {
    Object.assign(this, data);
  }
}
