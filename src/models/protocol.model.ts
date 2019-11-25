import {model, property} from '@loopback/repository';
import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique} from 'typeorm';
import {Instance} from './instance.model';


@Entity()
@model()
export class Protocol {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: false,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @property({
    type: 'string',
  })
  @Index('protocol_name_index')
  @Column({length: 250})
  name: string;

  @property({
    type: 'number',
    required: true,
  })
  @Column()
  port: number;

  @property({
    type: 'number',
  })
  @ManyToOne(type => Instance, instance => instance.protocols)
  @JoinColumn({name: 'instance_id'})
  instance?: Instance;

  constructor(data?: Partial<Protocol>) {
    Object.assign(this, data);
  }
}

export interface ProtocolRelations {
  // describe navigational properties here
}

export type InstanceServiceWithRelations = Protocol & ProtocolRelations;