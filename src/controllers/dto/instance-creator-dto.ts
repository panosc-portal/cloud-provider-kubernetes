import { model, property } from '@loopback/repository';
import { InstanceUserCreatorDto } from './instance-user-creator-dto';

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
  user: InstanceUserCreatorDto;

  constructor(data?: Partial<InstanceCreatorDto>) {
    Object.assign(this, data);
  }
}
