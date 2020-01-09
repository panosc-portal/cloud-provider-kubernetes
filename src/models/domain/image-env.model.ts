import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from 'typeorm';
import { property } from '@loopback/repository';
import { Image } from './image.model';

@Entity()
export class ImageEnv {

  @property({
    type: 'number',
    id: true,
    required: true,
    generated: true
  })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  key: string;

  @Column()
  value: string;

  @ManyToOne(type => Image,image=>image.volumes)
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image: Image


}
