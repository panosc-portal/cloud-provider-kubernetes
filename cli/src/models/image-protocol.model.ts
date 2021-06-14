import { Protocol } from './protocol.model';

export class ImageProtocol {
  id: number;
  port: number;
  protocol: Protocol;

  constructor(data?: Partial<ImageProtocol>) {
    Object.assign(this, data);
  }
}
