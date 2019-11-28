import { get, getModelSchemaRef, param, put, requestBody } from '@loopback/rest';
import { Flavour } from '../models';
import { inject } from '@loopback/context';
import { FlavourService } from '../services';
import { BaseController } from './BaseController';

export class FlavourController extends BaseController {
  constructor(@inject('services.FlavourService') private _flavourService: FlavourService) {
    super();
  }

  @get('/flavours', {
    summary: 'Get a list of all flavours',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Flavour) }
          }
        }
      }
    }
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
            schema: getModelSchemaRef(Flavour)
          }
        }
      }
    }
  })
  async getById(@param.path.string('id') id: number): Promise<Flavour> {
    const flavour = await this._flavourService.getById(id);

    this.throwNotFoundIfNull(flavour, 'Flavour with given id does not exist');

    return flavour;
  }

  @put('/flavour/{id}', {
    summary: 'Update an flavour by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Flavour)
          }
        }
      }
    }
  })
  updateById(@param.path.number('id') id: number, @requestBody() flavour: Flavour): Promise<Flavour> {
    this.throwBadRequestIfNull(flavour, 'Flavour with given id does not exist');
    this.throwBadRequestIfNotEqual(id, flavour.id, 'Id in path is not the same as body id');

    return this._flavourService.update(flavour);
  }
}
