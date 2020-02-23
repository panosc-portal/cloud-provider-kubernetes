import { model, property } from '@loopback/repository';

@model()
export class InstanceAccountCreatorDto {
  @property({
    type: 'number',
    required: true
  })
  userId: number;

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

  @property({
    type: 'string',
    required: true
  })
  email: string;
  
  constructor(data?: Partial<InstanceAccountCreatorDto>) {
    Object.assign(this, data);
  }
}
