import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { property } from '@loopback/repository';
import { Image } from './image.model';

@Entity()
export class ImageEnvVars {

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

  @ManyToOne(type => Image, image => image.volumes,{onDelete:'CASCADE'})
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image: Image;

}
