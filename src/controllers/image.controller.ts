// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/context';


import {get, getModelSchemaRef, param, put, requestBody} from '@loopback/openapi-v3';
import {Image} from '../models';
import {inject} from '@loopback/context';
import {ImageService} from '../services';
import {HttpErrors, Response, RestBindings} from '@loopback/rest';

export class ImageController {
  constructor(@inject('image-service') private _imageService: ImageService,
              @inject(RestBindings.Http.RESPONSE) protected response: Response) {
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
    return new Promise<Image>((resolve, reject) => {
      this._imageService.getById(id).then(image => {
        if (image != null) {
          resolve(image);

        } else {
          reject(new HttpErrors.NotFound('Image with given id does not exist'));
        }
      })
    });
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
  updateById(@param.path.number('id') id: number, @requestBody() image: Image): Promise<Image> {
    return new Promise<Image>((resolve, reject) => {
      if (id === image.id) {
        resolve(this._imageService.update(id, image));
      } else {
        reject(new HttpErrors.BadRequest('Id in path is not the same as body id'));
      }
    });

  }

}
