// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {get, getModelSchemaRef, param} from '@loopback/rest';
import {Flavour} from '../models';
import {inject} from '@loopback/context';
import {FlavourService} from '../services';

export class FlavourController {
  constructor(@inject('flavour-service') private _flavourService: FlavourService) {
  }

  @get('/flavours', {
    summary: 'Get a list of all flavours',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Flavour)},
          },
        },
      },
    },
  })
  getAll(): Promise<Flavour[]> {
    return this._flavourService.getAll();
  }

  @get('/flavours/{id}', {
    summary: 'Get a flavour by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Flavour),
          },
        },
      },
    },
  })
  getById(@param.path.string('id') id: number): Promise<Flavour> {
    return this._flavourService.getById(id);
  }


}
