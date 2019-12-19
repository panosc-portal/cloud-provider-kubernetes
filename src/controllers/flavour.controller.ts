import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/rest';
import { Flavour } from '../models';
import { inject } from '@loopback/context';
import { FlavourService } from '../services';
import { BaseController } from './base.controller';
import { FlavourCreatorDto } from './dto/flavour-creator-dto';
import { FlavourUpdatorDto } from './dto/flavour-updator-dto';

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

  @post('/flavours', {
    summary: 'Create a new flavour',
    responses: {
      '201': {
        description: 'Created',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Flavour)
          }
        }
      }
    }
  })
  async create(@requestBody() flavourCreator: FlavourCreatorDto): Promise<Flavour> {
    const flavour: Flavour = new Flavour({
      name: flavourCreator.name,
      description: flavourCreator.description,
      cpu: flavourCreator.cpu,
      memory: flavourCreator.memory
    });

    await this._flavourService.save(flavour);

    return flavour;
  }

  @put('/flavours/{id}', {
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
  async update(@param.path.number('id') id: number, @requestBody() flavourUpdator: FlavourUpdatorDto): Promise<Flavour> {
    this.throwBadRequestIfNull(flavourUpdator, 'Flavour with given id does not exist');
    this.throwBadRequestIfNotEqual(id, flavourUpdator.id, 'Id in path is not the same as body id');

    const flavour = await this._flavourService.getById(id);
    this.throwNotFoundIfNull(flavour, 'Flavour with given id does not exist');

    flavour.name = flavourUpdator.name;
    flavour.description = flavourUpdator.description;
    flavour.cpu = flavourUpdator.cpu;
    flavour.memory = flavourUpdator.memory;

    return this._flavourService.save(flavour);
  }

  @del('/flavours/{id}', {
    summary: 'Delete a flavour by a given identifier',
    responses: {
      '200': {
        description: 'Ok'
      }
    }
  })
  async delete(@param.path.string('id') id: number): Promise<boolean> {
    const flavour = await this._flavourService.getById(id);
    this.throwNotFoundIfNull(flavour, 'Flavour with given id does not exist');

    return this._flavourService.delete(flavour);
  }
}
