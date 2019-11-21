import {model, property} from '@loopback/repository';
import {Entity, PrimaryGeneratedColumn, Column, Index} from 'typeorm';

@Entity()
@model()
export class Image {

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
  @Index()
  @Column({length: 250})
  name: string;

  @property({
    type: 'string',
  })
  @Column({length: 2500, nullable: true})
  description?: string;

  constructor(data?: Partial<Image>) {
    Object.assign(this, data);
  }
}

export interface ImageRelations {
  // describe navigational properties here
}

export type ImageWithRelations = Image & ImageRelations;
