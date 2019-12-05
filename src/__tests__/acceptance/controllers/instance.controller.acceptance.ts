import { Client, expect } from '@loopback/testlab';
import { CloudProviderKubernetesApplication } from '../../..';
import { setupApplication } from '../../helpers/application.helper';
import { givenInitialisedDatabase } from '../../helpers/database.helper';
import { TypeORMDataSource } from '../../../datasources';
import { Instance } from '../../../models';

describe('InstanceController', () => {
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

  it('invokes GET /instances', async () => {
    const res = await client.get('/api/v1/instances').expect(200);

    const instances = res.body as Instance[];
    expect(instances).to.not.be.null();

    expect(instances.length).to.equal(3);
    instances.forEach(instance => {
      expect(instance.id).to.not.be.null();
    });
  });

  it('invokes GET /instances/{id}', async () => {
    const res = await client.get('/api/v1/instances/1').expect(200);

    const instance = res.body as Instance;
    expect(instance).to.not.be.null();
    expect(instance.id).to.equal(1);
    expect(instance.name).to.equal('instance1');
  });
});
