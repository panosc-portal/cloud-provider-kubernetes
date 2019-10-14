import {Entity, model, property} from '@loopback/repository';

@model()
export class Info extends Entity {
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
    super(data);
  }
}

export interface InfoRelations {
  // describe navigational properties here
}

export type InfoWithRelations = Info & InfoRelations;
