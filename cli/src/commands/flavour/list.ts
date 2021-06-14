import { mapFlavour } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { BaseCommand } from '../../utils';

export default class FlavourListCommand extends BaseCommand {

  static description = 'List flavours of the cloud provider'

  static examples = [
    `$ cloud-provider flavour:list`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(FlavourListCommand)
    
    this.cloudProviderUrl = flags.url;

    const flavours = await this.getFlavours();

    if (flavours.length > 0) {
      const flavourTableData = flavours.map(flavour => mapFlavour(flavour));

      printTable(flavourTableData);
    
    } else {
      console.log('The provider contains no flavours');
    }
  }
}
