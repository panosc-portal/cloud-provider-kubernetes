import { model, property } from '@loopback/repository';
import { Protocol } from './protocol.model';
import { Flavour } from './flavour.model';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn
} from 'typeorm';
import { Image } from './image.model';
import { InstanceStatus } from '../enumerations/instance-status.enum';
import { InstanceState } from './instance-state.model';

@Entity()
@model()
export class Instance {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: true
  })
  @PrimaryGeneratedColumn()
  id: number;

  @property({
    type: 'string',
    required: true
  })
  @Index('instance_name_index')
  @Column({ length: 250 })
  name: string;

  @property({
    type: 'string'
  })
  @Column({ length: 2500, nullable: true })
  description?: string;

  @Column({ length: 250 })
  namespace: string;

  @property({
    type: 'string',
    required: true
  })
  @Column({ length: 128 })
  hostname: string;

  @property({
    type: 'string'
  })
  @Column({ length: 50, nullable: true })
  private _computId: string;

  @property({
    type: 'string',
    required: true
  })
  @Column({ length: 50 })
  status: InstanceStatus;

  @property({
    type: 'number',
    required: true
  })
  @Column({ name: 'current_cpu', type: 'float' })
  currentCPU: number;

  @property({
    type: 'number',
    required: true
  })
  @Column({ name: 'current_memory' })
  currentMemory: number;

  @property({
    type: 'date',
    required: true
  })
  @CreateDateColumn({ name: 'created_at', type: process.env.NODE_ENV === 'test' ? 'date' : 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: process.env.NODE_ENV === 'test' ? 'date' : 'timestamp' })
  updatedAt: Date;

  @OneToMany(type => Protocol, protocol => protocol.instance, {
    eager: true,
    cascade: true
  })
  protocols: Protocol[];

  @property({ type: 'number' })
  @ManyToOne(type => Flavour, {
    eager: true
  })
  @JoinColumn({ name: 'flavour_id' })
  flavour: Flavour;

  @ManyToOne(type => Image, {
    eager: true
  })
  @property({ type: 'number' })
  @JoinColumn({ name: 'image_id' })
  image: Image;

  get state(): InstanceState {
    return new InstanceState({
      status: this.status,
      cpu: this.currentCPU,
      memory: this.currentMemory
    });
  }

  constructor(data?: Partial<Instance>) {
    Object.assign(this, data);
  }

  addProtocol(protocol: Protocol) {
    this.protocols.push(protocol);
  }

  set computId(value: string) {
    this._computId = value;
  }
}
