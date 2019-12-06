import { get, getModelSchemaRef, param, put, requestBody } from '@loopback/openapi-v3';
import { Image } from '../models';
import { inject } from '@loopback/context';
import { ImageService } from '../services';
import { BaseController } from './base.controller';

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
}
