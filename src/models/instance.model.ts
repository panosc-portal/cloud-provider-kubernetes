import {model, property} from '@loopback/repository';
import { Protocol} from './protocol.model';
import {Flavour} from './flavour.model';
import {Column, Entity, Index, JoinColumn, OneToMany, ManyToOne, PrimaryGeneratedColumn, Unique} from 'typeorm';
import {Image} from './image.model';


@Entity()
@model()
export class Instance {
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
  @Index('instance_name_index')
  @Column({length: 250})
  name: string;

  @property({
    type: 'string',
  })
  @Column({length: 2500, nullable: true})
  description?: string;


  @property({
    type: 'string',
    required: true,
  })
  @Column({length: 128})
  hostname: string;

  @property({
    type: 'string',
    required: true,
  })
  @Column({length: 50})
  state: string;

  @property({
    type: 'number',
    required: true,
  })
  @Column({name: 'current_cpu', type: 'float'})
  currentCPU: number;

  @property({
    type: 'number',
    required: true,
  })
  @Column({name: 'current_memory'})
  currentMemory: number;

  @property({
    type: 'date',
    required: true,
  })
  @Column({name: 'created_at', type: 'date'})
  createdAt: string;

  @OneToMany(type => Protocol, protocol => protocol.instance, {
    eager: true
  })
  protocols: Protocol[];

  @ManyToOne(type => Flavour, {
    eager: true
  })
  @JoinColumn({name: 'flavour_id'})
  @Unique("flavour_id_pkey",["flavour_id"])
  flavour: Flavour;

  @ManyToOne(type => Image, {
    eager: true
  })
  @JoinColumn({name: 'image_id'})
  @Unique("image_id_pkey",["image_id"])
  image: Image;

  constructor(data?: Partial<Instance>) {
    Object.assign(this, data);
  }
}

export interface InstanceRelations {
}

export type InstanceWithRelations = Instance & InstanceRelations;
