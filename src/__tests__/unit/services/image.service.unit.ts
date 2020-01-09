import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext } from '../../helpers/context.helper';
import { ImageService, ImageProtocolService, ImageVolumeService } from '../../../services';
import { Image } from '../../../models';

describe('ImageService', () => {
  let imageService: ImageService;
  let imageProtocolService: ImageProtocolService;
  let imageVolumeService: ImageVolumeService;

  before('getImageService', async () => {
    const testApplicationContext = createTestApplicationContext();
    imageService = testApplicationContext.imageService;
    imageProtocolService = testApplicationContext.imageProtocolService;
    imageVolumeService = testApplicationContext.imageVolumeService;
  });

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all images', async () => {
    const images = await imageService.getAll();
    expect(images.length).to.equal(4);
  });

  it('gets an image', async () => {
    const image = await imageService.getById(1);

    expect(image || null).to.not.be.null();
    expect(image.name).to.equal('image 1');
  });

  it('saves an image', async () => {
    const image = new Image({
      name: 'image 3',
      path: 'repo/image',
      description: 'A new image'
    });
    await imageService.save(image);
    expect(image.id || null).to.not.be.null();

    const persistedImage = await imageService.getById(image.id);
    expect(persistedImage || null).to.not.be.null();
  });

  it('deletes an image', async () => {
    let images = await imageService.getAll();
    expect(images.length).to.equal(4);

    const image = images.find(anImage => anImage.id === 3);
    expect(image || null).to.not.be.null();

    await imageService.delete(image);

    images = await imageService.getAll();
    expect(images.length).to.equal(3);
  });

  it('deletes protocols when deleting an image', async () => {
    let images = await imageService.getAll();
    expect(images.length).to.equal(4);

    const image = images.find(anImage => anImage.id === 3);
    expect(image || null).to.not.be.null();
    const protocols = image.protocols;
    expect(protocols || null).to.not.be.null();
    expect(protocols.length).to.be.greaterThan(0);

    await imageService.delete(image);

    images = await imageService.getAll();
    expect(images.length).to.equal(3);

    // make sure protocols deleted
    const persistedImageProtocol = await imageProtocolService.getById(protocols[0].id);
    expect(persistedImageProtocol || null).to.be.null();
  });

  it('deletes volumes when deleting an image', async () => {
    let images = await imageService.getAll();
    expect(images.length).to.equal(4);

    const image = images.find(anImage => anImage.id === 3);
    expect(image || null).to.not.be.null();
    const volumes = image.volumes;
    expect(volumes || null).to.not.be.null();
    expect(volumes.length).to.be.greaterThan(0);

    await imageService.delete(image);

    images = await imageService.getAll();
    expect(images.length).to.equal(3);

    // make sure volumes deleted
    const persistedImageVolume = await imageVolumeService.getById(volumes[0].id);
    expect(persistedImageVolume || null).to.be.null();
  });

  it('updates an image', async () => {
    const images = await imageService.getAll();

    const image = images[0];
    image.name = 'A new name';

    const persistedImage = await imageService.save(image);
    expect(persistedImage || null).to.not.be.null();
    expect(persistedImage.id).to.equal(image.id);
    expect(persistedImage.name).to.equal(image.name);

    const imagesAfterUpdate = await imageService.getAll();
    expect(imagesAfterUpdate.length).to.equal(images.length);
  });
});
