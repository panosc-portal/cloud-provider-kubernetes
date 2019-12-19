import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/openapi-v3';
import { Image, Protocol } from '../models';
import { inject } from '@loopback/context';
import { ImageService } from '../services';
import { BaseController } from './base.controller';
import { ImageCreatorDto } from './dto/image-creator-dto';

export class ImageController extends BaseController {
  constructor(@inject('services.ImageService') private _imageService: ImageService) {
    super();
  }

  @get('/images', {
    summary: 'Get a list of all images',
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Image) }
          }
        }
      }
    }
  })
  getAll(): Promise<Image[]> {
    return this._imageService.getAll();
  }

  @get('/images/protocols', {
    summary: 'Get a list of all image protocols',
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: { type: 'array', items: getModelSchemaRef(Protocol) }
          }
        }
      }
    }
  })
  getAllProtocols(): Promise<Protocol[]> {
    return this._imageService.getAllProtocols();
  }

  @get('/images/{id}', {
    summary: 'Get an image by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image)
          }
        }
      }
    }
  })
  async getById(@param.path.string('id') id: number): Promise<Image> {
    const image = await this._imageService.getById(id);

    this.throwNotFoundIfNull(image, 'Image with given id does not exist');

    return image;
  }

  @post('/images', {
    summary: 'Create a new image',
    responses: {
      '201': {
        description: 'Created',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image)
          }
        }
      }
    }
  })
  async create(@requestBody() imageCreator: ImageCreatorDto): Promise<Image> {
    const protocols = await this._imageService.getProtocolByIds(imageCreator.protocolIds);

    const image: Image = new Image({
      name: imageCreator.name,
      description: imageCreator.description,
      repository: imageCreator.repository,
      path: imageCreator.path,
      protocols: protocols
    });

    await this._imageService.save(image);

    return image;
  }
  @put('/images/{id}', {
    summary: 'Update an image by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image)
          }
        }
      }
    }
  })
  updateById(@param.path.number('id') id: number, @requestBody() image: Image): Promise<Image> {
    this.throwBadRequestIfNull(image, 'Image with given id does not exist');
    this.throwBadRequestIfNotEqual(id, image.id, 'Id in path is not the same as body id');

    return this._imageService.update(image);
  }

  @del('/images/{id}', {
    summary: 'Delete an image by a given identifier',
    responses: {
      '200': {
        description: 'Ok'
      }
    }
  })
  async delete(@param.path.string('id') id: number): Promise<boolean> {
    const image = await this._imageService.getById(id);
    this.throwNotFoundIfNull(image, 'Image with given id does not exist');

    return this._imageService.delete(image);
  }

}
