import {expect} from '@loopback/testlab';
import { buildDataBase } from '../../helpers/database.helper';
import { setupTestApplicationContext } from '../../helpers/context.helper';
import { ImageService } from '../../../services';

describe('ImageService', () => {
  let imageService: ImageService;

  before('getImageService', async () => {
    await buildDataBase();

    const context = setupTestApplicationContext();
    imageService = context.imageService;

  });


  it('gets all images', async () => {
    const images = await imageService.getAll();

    expect(images.length).to.equal(0);
  });

  it('gets an image', async () => {
    const image = await imageService.getById(1);

    expect(image).to.be.null;
  });
});
