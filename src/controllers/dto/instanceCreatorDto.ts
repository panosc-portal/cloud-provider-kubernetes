import {model, property} from '@loopback/repository';


@model()
export class InstanceCreatorDto {

  @property({
    type: 'string',
    required: true,
  })
  name: string;

  @property({
    type: 'string',
  })
  description?: string;


  @property({
    type: 'string',
    required: true,
  })
  hostname: string;


  @property({type: 'number'}) private _flavourId: number;


  @property({type: 'number'}) private _imageId: number;


  get flavourId(): number {
    return this._flavourId;
  }

  get imageId(): number {
    return this._imageId;
  }

  constructor(data?: Partial<InstanceCreatorDto>) {
    Object.assign(this, data);
  }
}

export interface InstanceCreatorDtoRelations {
}

export type InstanceWithRelations = InstanceCreatorDto & InstanceCreatorDtoRelations;
