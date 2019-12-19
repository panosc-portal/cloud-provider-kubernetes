import { get, getModelSchemaRef, param, put, requestBody, post, del } from '@loopback/openapi-v3';
import { Image, Protocol } from '../models';
import { inject } from '@loopback/context';
import { ImageService } from '../services';
import { BaseController } from './base.controller';
import { ImageCreatorDto } from './dto/image-creator-dto';
import { ImageUpdatorDto } from './dto/image-updator-dto';

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
  async updateById(@param.path.number('id') id: number, @requestBody() imageUpdator: ImageUpdatorDto): Promise<Image> {
    this.throwBadRequestIfNull(imageUpdator, 'Image with given id does not exist');
    this.throwBadRequestIfNotEqual(id, imageUpdator.id, 'Id in path is not the same as body id');

    const image = await this._imageService.getById(id);
    this.throwNotFoundIfNull(image, 'Image with given id does not exist');

    const protocols = await this._imageService.getProtocolByIds(imageUpdator.protocolIds);

    image.name = imageUpdator.name;
    image.description = imageUpdator.description;
    image.repository = imageUpdator.repository;
    image.path = imageUpdator.path;
    image.protocols = protocols;

    return this._imageService.save(image);
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
