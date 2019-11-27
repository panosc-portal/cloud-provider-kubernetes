// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {get, getModelSchemaRef, param, put, requestBody} from '@loopback/rest';
import {Flavour} from '../models';
import {inject} from '@loopback/context';
import {FlavourService} from '../services';
import {HttpErrors} from '@loopback/rest/dist';

export class FlavourController {
  constructor(@inject('services.FlavourService') private _flavourService: FlavourService) {
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

  @put('/flavour/{id}', {
    summary: 'Update an flavour by a given identifier',
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
  updateById(@param.path.number('id') id: number, @requestBody() flavour: Flavour): Promise<Flavour> {
    if (id === flavour.id) {
      throw new HttpErrors.BadRequest('Id in path is not the same as body id');
    }
    return this._flavourService.update(flavour);
  }


}
