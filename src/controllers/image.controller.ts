// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {get, getModelSchemaRef, param, put} from '@loopback/openapi-v3';
import {Image} from '../models';
import {inject} from '@loopback/context';
import {ImageService} from '../services';

export class ImageController {
  constructor(@inject('image-service') private _imageService: ImageService) {
  }

  @get('/images', {
    summary: 'Get a list of all images',
    responses: {
      '200': {
        description: 'OK',
        content: {
          'application/json': {
            schema: {type: 'array', items: getModelSchemaRef(Image)},
          },
        },
      },
    },
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
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  getById(@param.path.string('id') id: number): Promise<Image> {
    return this._imageService.getById(id);
  }

  @put('/images/{id}', {
    summary: 'Update an image by a given identifier',
    responses: {
      '200': {
        description: 'Ok',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Image),
          },
        },
      },
    },
  })
  updateById(@param.path.string('id') id: number): Promise<Image> {
    return this._imageService.updateById(id);
  }

}
