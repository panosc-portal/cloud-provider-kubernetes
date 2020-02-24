import { model, property } from '@loopback/repository';
import { Column, Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Image } from './image.model';
import { Protocol } from './protocol.model';

@Entity()
@model()
export class ImageProtocol {
  @property({
    type: 'number',
    id: true,
    required: true,
    generated: true
  })
  @PrimaryGeneratedColumn()
  id: number;

  @property({
    type: 'number'
  })
  @Column({ nullable: true })
  port: number;

  @property({ type: Protocol, required: true })
  @ManyToOne(type => Protocol, { eager: true, nullable: false })
  @JoinColumn({ name: 'protocol_id' })
  protocol: Protocol;

  @ManyToOne(type => Image, image => image.protocols, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'image_id', referencedColumnName: 'id' })
  image: Image;

  constructor(data?: Partial<ImageProtocol>) {
    Object.assign(this, data);
  }

  getPort(): number {
    if (this.port == null) {
      return this.protocol.defaultPort;
    }

    return this.port;
  }
}
