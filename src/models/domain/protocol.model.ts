import {model, property} from '@loopback/repository';
import {Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from 'typeorm';
import {Instance} from './instance.model';
import { ProtocolName } from '../enumerations/ProtocolName';

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
  name: ProtocolName;

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
