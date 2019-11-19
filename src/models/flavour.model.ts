import {model, property} from '@loopback/repository';
import {Column, Entity, PrimaryGeneratedColumn} from 'typeorm';

@Entity()
@model()
export class Flavour {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: true,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @property({
    type: 'string',
    required: true,
  })
  @Column()
  name: string;

  @property({
    type: 'string',
  })
  @Column()
  description?: string;

  @property({
    type: 'number',
    required: true,
  })
  @Column()
  cpu: number;

  @property({
    type: 'number',
    required: true,
  })
  @Column()
  memory: number;

  constructor(data?: Partial<Flavour>) {
    Object.assign(this, data);
  }
}

export interface FlavourRelations {
  // describe navigational properties here
}

export type FlavourWithRelations = Flavour & FlavourRelations;
