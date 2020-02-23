import { model, property } from '@loopback/repository';
import { InstanceAccountCreatorDto } from './instance-account-creator-dto';

@model()
export class InstanceCreatorDto {
  @property({ type: 'string', required: true })
  name: string;

  @property({ type: 'string' })
  description?: string;

  @property({ type: 'number' })
  flavourId: number;

  @property({ type: 'number' })
  imageId: number;

  @property()
  account: InstanceAccountCreatorDto;

  constructor(data?: Partial<InstanceCreatorDto>) {
    Object.assign(this, data);
  }
}
