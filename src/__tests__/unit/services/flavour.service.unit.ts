import { expect } from '@loopback/testlab';
import { givenInitialisedTestDatabase } from '../../helpers/database.helper';
import { createTestApplicationContext } from '../../helpers/context.helper';
import { FlavourService } from '../../../services';
import { Flavour } from '../../../models';

describe('FlavourService', () => {
  let flavourService: FlavourService;

  before('getFlavourService', async () => {
    const testApplicationContext = createTestApplicationContext();
    flavourService = testApplicationContext.flavourService;
  });

  beforeEach('Initialise Database', givenInitialisedTestDatabase);

  it('gets all flavours', async () => {
    const flavours = await flavourService.getAll();
    expect(flavours.length).to.equal(3);
  });

  it('gets a flavour', async () => {
    const flavour = await flavourService.getById(1);

    expect(flavour || null).to.not.be.null();
    expect(flavour.name).to.equal('flavour 1');
  });

  it('saves a flavour', async () => {
    const flavours = await flavourService.getAll();
    expect(flavours.length).to.equal(3);

    const flavour = new Flavour({
      name: 'flavour 4',
      description: 'A new flavour',
      memory: 1024,
      cpu: 4
    });
    await flavourService.save(flavour);
    expect(flavour.id || null).to.not.be.null();

    const persistedFlavour = await flavourService.getById(flavour.id);
    expect(persistedFlavour || null).to.not.be.null();
  });

  it('deletes a flavour', async () => {
    let flavours = await flavourService.getAll();

    const flavour = flavours.find(aFlavour => aFlavour.id === 3);

    await flavourService.delete(flavour);

    flavours = await flavourService.getAll();
    expect(flavours.length).to.equal(2);
  });

  it('updates a flavour', async () => {
    const flavours = await flavourService.getAll();

    const flavour = flavours[0];
    flavour.name = 'A new name';

    const persistedFlavour = await flavourService.save(flavour);
    expect(persistedFlavour || null).to.not.be.null();
    expect(persistedFlavour.id).to.equal(flavour.id);
    expect(persistedFlavour.name).to.equal(flavour.name);

    const flavoursAfterUpdate = await flavourService.getAll();
    expect(flavoursAfterUpdate.length).to.equal(flavours.length);
  });
});
