import { model, property } from '@loopback/repository';
import { Entity, PrimaryGeneratedColumn, Column, Index, ManyToMany, JoinTable, OneToMany } from 'typeorm';
import { Protocol } from './protocol.model';
import { ImageVolume } from './image-volume.model';
import { ImageEnvVar } from './image-env-var.model';
import { ImageProtocol } from './image-protocol.model';
import { Instance } from './instance.model';

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
    required: false
  })
  @Index('image_repository_index')
  @Column({ length: 250, nullable: true })
  repository: string;

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

  @property({
    type: 'array',
    itemType: 'object'
  })
  @OneToMany(type => ImageProtocol, imageProtocol => imageProtocol.image, {
    eager: true,
    cascade: true
  })
  protocols: ImageProtocol[];

  @property({
    type: 'string'
  })
  @Column({ length: 2500, nullable: true })
  command: string;

  @property({
    type: 'string'
  })
  @Column({ length: 2500, nullable: true })
  args: string;

  @property({
    type: 'number'
  })
  @Column({ name: 'run_as_uid', nullable: true })
  runAsUID: number;

  @property({ type: 'array', itemType: ImageVolume })
  @OneToMany(type => ImageVolume, imageVolume => imageVolume.image, { eager: true, cascade: true })
  volumes: ImageVolume[];

  @property({ type: 'array', itemType: ImageEnvVar })
  @OneToMany(type => ImageEnvVar, imageEnvVars => imageEnvVars.image, { eager: true, cascade: true })
  envVars: ImageEnvVar[];

  @OneToMany(type => Instance, instance => instance.image, { cascade: true })
  instances: Instance[];

  constructor(data?: Partial<Image>) {
    Object.assign(this, data);
  }
}
