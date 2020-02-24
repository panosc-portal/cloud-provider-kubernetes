import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinColumn } from 'typeorm';
import { model, property } from '@loopback/repository';
import { Image } from './image.model';

@Entity()
@model()
export class ImageVolume {
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
  @Column({ unique: true, length: 250 })
  name: string;

  @property({
    type: 'string',
    required: true
  })
  @Column({ length: 250 })
  path: string;

  @property({
    type: 'boolean',
    required: true
  })
  @Column({ name: 'read_only' })
  readOnly: boolean;

  @ManyToOne(type => Image, image => image.volumes, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image: Image;

  constructor(data?: Partial<ImageVolume>) {
    Object.assign(this, data);
  }
}
