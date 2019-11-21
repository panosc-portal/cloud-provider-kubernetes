import {model, property} from '@loopback/repository';
import {Column, Entity, Index, PrimaryGeneratedColumn} from 'typeorm';

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
  @Index('flavour_name_index')
  @Column({length:250})
  name: string;

  @property({
    type: 'string',
  })
  @Column({length:2500,nullable:true})
  description?: string;

  @property({
    type: 'number',
    required: true,
  })
  @Column({type:'float'})
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
