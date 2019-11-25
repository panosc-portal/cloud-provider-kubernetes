import {Client, expect} from '@loopback/testlab';
import {CloudProviderKubernetesApplication} from '../../..';
import {setupApplication} from '../../helpers/application.helper';
import { givenInitialisedDatabase } from '../../helpers/database.helper';
import { TypeORMDataSource } from '../../../datasources';
import { Flavour } from '../../../models';

describe('FlavourController', () => {
  let app: CloudProviderKubernetesApplication;
  let client: Client;
  let datasource: TypeORMDataSource;

  before('setupApplication', async () => {
    ({app, client, datasource} = await setupApplication());
  });

  after(async () => {
    await app.stop();
  });

  beforeEach('Initialise Database', function () { return givenInitialisedDatabase(datasource) });

  it('invokes GET /flavours', async () => {
    const res = await client.get('/api/v1/flavours').expect(200);

    const flavours = res.body as Flavour[];
    expect(flavours).to.not.be.null;

    expect(flavours.length).to.equal(3);
    flavours.forEach(flavour => {
      expect(flavour.id).to.not.be.null;
    });
  });

  it('invokes GET /flavours/{id}', async () => {
    const res = await client.get('/api/v1/flavours/1').expect(200);

    const flavour = res.body as Flavour;
    expect(flavour).to.not.be.null;
    expect(flavour.id).to.equal(1);
    expect(flavour.name).to.equal('flavour 1');
  });
});
