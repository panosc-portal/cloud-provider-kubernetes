import {
  Column,
  Entity, ManyToOne, PrimaryGeneratedColumn, Unique
} from 'typeorm';
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
  @Column({ unique: true })
  name: string;

  @property({
    type: 'string',
    required: true
  })
  @Column()
  path: string;

  @property({
    type: 'boolean',
    required: true
  })
  @Column()
  readonly: boolean;

  @ManyToOne(type => Image, image => image.volumes)
  image: Image;
}

