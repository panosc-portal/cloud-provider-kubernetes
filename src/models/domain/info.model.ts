import {model, property} from '@loopback/repository';

@model()
export class Info {
  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
    required: true,
  })
  version: string;


  constructor(data?: Partial<Info>) {
    Object.assign(this, data);
  }
}
