import {Entity, model, property} from '@loopback/repository';

@model()
export class Metrics extends Entity {
  @property({
    type: 'object',
  })
  instances?: {count:number,active:number,inactive:number};

  @property({
    type: 'object',
  })
  system?: {cpu:number,memory:number};

  @property({
    type: 'object',
  })
  images?: {count:number,usage:number};

  @property({
    type: 'object',
  })
  flavours?: {count:number,usage:number};


  constructor(data?: Partial<Metrics>) {
    super(data);
  }
}

export interface MetricsRelations {
  // describe navigational properties here
}

export type MetricsWithRelations = Metrics & MetricsRelations;
