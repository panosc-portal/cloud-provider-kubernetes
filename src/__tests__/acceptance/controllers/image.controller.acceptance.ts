import { Client, expect } from '@loopback/testlab';
import { CloudProviderKubernetesApplication } from '../../..';
import { setupApplication } from '../../helpers/application.helper';
import { givenInitialisedDatabase } from '../../helpers/database.helper';
import { TypeORMDataSource } from '../../../datasources';
import { Image } from '../../../models';

describe('ImageController', () => {
  let app: CloudProviderKubernetesApplication;
  let client: Client;
  let datasource: TypeORMDataSource;

  before('setupApplication', async () => {
    ({ app, client, datasource } = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  beforeEach('Initialise Database', function() {
    return givenInitialisedDatabase(datasource);
  });

  it('invokes GET /images', async () => {
    const res = await client.get('/api/v1/images').expect(200);

    const images = res.body as Image[];
    expect(images).to.not.be.null();

    expect(images.length).to.equal(3);
    images.forEach(image => {
      expect(image.id).to.not.be.null();
    });
  });

  it('invokes GET /images/{id}', async () => {
    const res = await client.get('/api/v1/images/1').expect(200);

    const image = res.body as Image;
    expect(image).to.not.be.null();
    expect(image.id).to.equal(1);
    expect(image.name).to.equal('image 1');
  });
});
