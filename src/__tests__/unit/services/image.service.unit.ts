import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext } from '../../helpers/context.helper';
import { ImageService, ImageProtocolService, ImageVolumeService } from '../../../services';
import { Image, ImageProtocol } from '../../../models';

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
    expect(images.length).to.equal(5);
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
    expect(images.length).to.equal(5);

    const image = images.find(anImage => anImage.id === 3);
    expect(image || null).to.not.be.null();

    await imageService.delete(image);

    images = await imageService.getAll();
    expect(images.length).to.equal(4);
  });

  it('deletes protocols when deleting an image', async () => {
    let images = await imageService.getAll();
    expect(images.length).to.equal(5);

    const image = images.find(anImage => anImage.id === 3);
    expect(image || null).to.not.be.null();
    const protocols = image.protocols;
    expect(protocols || null).to.not.be.null();
    expect(protocols.length).to.be.greaterThan(0);

    await imageService.delete(image);

    images = await imageService.getAll();
    expect(images.length).to.equal(4);

    // make sure protocols deleted
    const persistedImageProtocol = await imageProtocolService.getById(protocols[0].id);
    expect(persistedImageProtocol || null).to.be.null();
  });

  it('deletes volumes when deleting an image', async () => {
    let images = await imageService.getAll();
    expect(images.length).to.equal(5);

    const image = images.find(anImage => anImage.id === 3);
    expect(image || null).to.not.be.null();
    const volumes = image.volumes;
    expect(volumes || null).to.not.be.null();
    expect(volumes.length).to.be.greaterThan(0);

    await imageService.delete(image);

    images = await imageService.getAll();
    expect(images.length).to.equal(4);

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

  it('Saves a protocol with an image', async () => {
    const protocols = await imageService.getProtocolByIds([1, 2]);
    const protocol1 = new ImageProtocol({ port: 1000, protocol: protocols[0] });
    const protocol2 = new ImageProtocol({ protocol: protocols[1] });

    const image: Image = new Image({
      name: 'test',
      path: 'test',
      protocols: [protocol1, protocol2]
    });

    const persistedImage = await imageService.save(image);

    expect(persistedImage.protocols || null).to.not.be.null();
    expect(persistedImage.protocols.length).to.equal(2);

    const persistedProtocol1 = persistedImage.protocols.find(
      protocol => protocol.protocol.id === protocol1.protocol.id
    );
    const persistedProtocol2 = persistedImage.protocols.find(
      protocol => protocol.protocol.id === protocol2.protocol.id
    );

    expect(persistedProtocol1).to.not.be.null();
    expect(persistedProtocol2).to.not.be.null();
    expect(persistedProtocol1.port).to.equal(1000);
    expect(persistedProtocol2.port).to.be.null();
  });
});
