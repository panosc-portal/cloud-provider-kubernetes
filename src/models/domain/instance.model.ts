import { model, property } from '@loopback/repository';
import { InstanceProtocol } from './instance-protocol.model';
import { Flavour } from './flavour.model';
import { Column, Entity, Index, JoinColumn, OneToMany, ManyToOne, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToOne } from 'typeorm';
import { Image } from './image.model';
import { InstanceStatus } from '../enumerations';
import { InstanceState } from './instance-state.model';
import { InstanceUser } from './instance-user.model';

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

  @Column({ length: 250,nullable: true })
  namespace: string;

  @property({
    type: 'string',
    required: true
  })
  @Column({ length: 128, nullable: true })
  hostname: string;

  @property({
    type: 'string',
    required: true
  })
  @Column({ length: 128, nullable: true,name: 'node_hostname' })
  nodeHostname: string;

  @property({
    type: 'string'
  })
  @Column({ length: 50, nullable: true,name: 'compute_id' })
  computeId: string;

  @property({
    type: 'string',
    required: true
  })
  @Column({ length: 50 })
  status: InstanceStatus;

  @property({
    type: 'string',
  })
  @Column({ length: 2500, nullable: true, name: 'status_message' })
  statusMessage: string;

  @property({
    type: 'number',
    required: true
  })
  @Column({ name: 'current_cpu', type: 'float', nullable: true })
  currentCPU: number;

  @property({
    type: 'number',
    required: true
  })
  @Column({ name: 'current_memory', nullable: true })
  currentMemory: number;

  @property({
    type: 'date',
    required: true
  })
  @CreateDateColumn({ name: 'created_at', type: process.env.NODE_ENV === 'test' ? 'date' : 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: process.env.NODE_ENV === 'test' ? 'date' : 'timestamp' })
  updatedAt: Date;

  @Column({ name: 'deleted', nullable: false, default: false })
  deleted: boolean;

  @property({
    type: 'array',
    itemType: 'object'
  })
  @OneToMany(type => InstanceProtocol, protocol => protocol.instance, {
    eager: true,
    cascade: true
  })
  protocols: InstanceProtocol[];

  @property({ type: 'number' })
  @ManyToOne(type => Flavour, { eager: true, nullable: false })
  @JoinColumn({ name: 'flavour_id' })
  flavour: Flavour;

  @property({ type: 'number' })
  @ManyToOne(type => Image, { eager: true, nullable: false })
  @JoinColumn({ name: 'image_id', })
  image: Image;

  @property({ type: 'number' })
  @OneToOne(type => InstanceUser, user => user.instance, {
    eager: true,
    cascade: true
  })
  user: InstanceUser;

  get state(): InstanceState {
    return new InstanceState({
      status: this.status,
      cpu: this.currentCPU,
      memory: this.currentMemory
    });
  }

  set state(value: InstanceState) {
    this.status = value.status;
    this.statusMessage = value.message;
    this.currentCPU = value.cpu;
    this.currentMemory = value.memory;
  }

  constructor(data?: Partial<Instance>) {
    Object.assign(this, data);
  }

  addProtocol(protocol: InstanceProtocol) {
    this.protocols.push(protocol);
  }
}
