import { model, property } from '@loopback/repository';
import { Column, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Instance } from './instance.model';
import { ProtocolName } from '../enumerations';

@Entity()
@model()
export class InstanceProtocol {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: true
  })
  @PrimaryGeneratedColumn()
  id: number;

  @property({
    type: 'string'
  })
  @Index('instance_protocol_name_index')
  @Column({ length: 250 })
  name: ProtocolName;

  @property({
    type: 'number',
    required: true
  })
  @Column()
  port: number;

  @ManyToOne(type => Instance, instance => instance.protocols, {onDelete: 'CASCADE', nullable: false})
  @JoinColumn({ name: 'instance_id' })
  instance: Instance;

  constructor(data?: Partial<InstanceProtocol>) {
    Object.assign(this, data);
  }
}
