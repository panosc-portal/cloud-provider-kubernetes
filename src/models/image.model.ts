import {model, property} from '@loopback/repository';
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

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
  @Column()
  name: string;

  @property({
    type: 'string',
  })
  @Column()
  description?: string;

  constructor() {
  }
}

export interface ImageRelations {
  // describe navigational properties here
}

export type ImageWithRelations = Image & ImageRelations;
