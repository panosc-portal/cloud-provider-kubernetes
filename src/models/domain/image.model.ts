import { model, property } from '@loopback/repository';
import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToMany, JoinTable } from 'typeorm';
import { Protocol } from './protocol.model';

@Entity()
@model()
export class Image {
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
  @Index('image_name_index')
  @Column({ length: 250 })
  name: string;

  @property({
    type: 'string',
    required: true
  })
  @Index('image_path_index')
  @Column({ length: 250 })
  path: string;

  @property({
    type: 'string'
  })
  @Column({ length: 2500, nullable: true })
  description?: string;

  @ManyToMany(type => Protocol, {
    eager: true,
    cascade: true
  })
  @JoinTable({name: 'image_protocol', joinColumns: [{name: 'image_id'}], inverseJoinColumns: [{name: 'protocol_id' }]})
  protocols: Protocol[];

  constructor(data?: Partial<Image>) {
    Object.assign(this, data);
  }
}
