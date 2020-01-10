import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { model, property } from '@loopback/repository';
import { Image } from './image.model';

@Entity()
@model()
export class ImageEnvVar {

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
  @Column()
  name: string;

  @property({
    type: 'string',
    required: true
  })
  @Column()
  value: string;

  @ManyToOne(type => Image, image => image.envVars,{onDelete:'CASCADE'})
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image: Image;

}
