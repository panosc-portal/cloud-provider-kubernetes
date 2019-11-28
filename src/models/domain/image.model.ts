import { model, property } from '@loopback/repository';
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

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
    type: 'string'
  })
  @Column({ length: 2500, nullable: true })
  description?: string;

  constructor(data?: Partial<Image>) {
    Object.assign(this, data);
  }
}
