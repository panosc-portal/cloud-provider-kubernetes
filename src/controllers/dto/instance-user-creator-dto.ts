import { model, property } from '@loopback/repository';

@model()
export class InstanceUserCreatorDto {
  @property({
    type: 'number',
    required: true
  })
  accountId: number;

  @property({
    type: 'string',
    required: true
  })
  username: string;

  @property({
    type: 'string',
  })
  firstName: string;

  @property({
    type: 'string',
  })
  lastName: string;

  @property({
    type: 'number',
    required: true
  })
  gid: number;

  @property({
    type: 'number',
    required: true
  })
  uid: number;

  @property({
    type: 'string',
    required: true
  })
  homePath: string;
  
  constructor(data?: Partial<InstanceUserCreatorDto>) {
    Object.assign(this, data);
  }
}
