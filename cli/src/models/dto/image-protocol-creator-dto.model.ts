
export class ImageProtocolCreatorDto {
  port: number;
  protocolId: number;

  constructor(data?: Partial<ImageProtocolCreatorDto>) {
    Object.assign(this, data);
  }
}
