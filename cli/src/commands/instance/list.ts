import { BaseCommand } from '../../utils/base-command'
import { mapInstance } from '../../views/model.view'
import { printTable } from "console-table-printer";

export default class InstanceListCommand extends BaseCommand {

  static description = 'List instances of the cloud provider'

  static examples = [
    `$ cloud-provider instance:list`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(InstanceListCommand)
    
    this.cloudProviderUrl = flags.url;

    const instances = await this.getInstances();

    if (instances.length > 0) {
      const instanceTableData = instances.map(instance => mapInstance(instance));

      printTable(instanceTableData);
    
    } else {
      console.log('The provider contains no instances')
    }
  }
}
