import {Entity, model, property} from '@loopback/repository';

@model()
export class Flavour extends Entity {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: true,
  })
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;

  @property({
    type: 'number',
    required: true,
  })
  cpu: number;

  @property({
    type: 'number',
    required: true,
  })
  memory: number;


  constructor(data?: Partial<Flavour>) {
    super(data);
  }
}

export interface FlavourRelations {
  // describe navigational properties here
}

export type FlavourWithRelations = Flavour & FlavourRelations;
