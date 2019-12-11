import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext } from '../../helpers/context.helper';
import { ImageService } from '../../../services';
import { Image } from '../../../models';

describe('ImageService', () => {
  let imageService: ImageService;

  before('getImageService', async () => {
    const testApplicationContext = createTestApplicationContext();
    imageService = testApplicationContext.imageService;
  });

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all images', async () => {
    const images = await imageService.getAll();
    expect(images.length).to.equal(3);
  });

  it('gets an image', async () => {
    const image = await imageService.getById(1);

    expect(image).to.not.be.null();
    expect(image.name).to.equal('image 1');
  });

  it('saves an image', async () => {
    const image = new Image({
      name: 'image 3',
      path: 'repo/image',
      description: 'A new image'
    });
    await imageService.save(image);
    expect(image.id).to.not.be.null();

    const persistedImage = await imageService.getById(image.id);
    expect(persistedImage).to.not.be.null();
  });

  it('deletes an image', async () => {
    let images = await imageService.getAll();
    expect(images.length).to.equal(3);

    const image = images.find(anImage => anImage.id === 3);

    await imageService.delete(image);

    images = await imageService.getAll();
    expect(images.length).to.equal(2);
  });

  it('updates an image', async () => {
    const images = await imageService.getAll();

    const image = images[0];
    image.name = 'A new name';

    const persistedImage = await imageService.save(image);
    expect(persistedImage).to.not.be.null();
    expect(persistedImage.id).to.equal(image.id);
    expect(persistedImage.name).to.equal(image.name);

    const imagesAfterUpdate = await imageService.getAll();
    expect(imagesAfterUpdate.length).to.equal(images.length);
  });
});
