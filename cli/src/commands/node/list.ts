import {BaseCommand} from '../../utils'
import {mapNode} from '../../views/model.view'
import {printTable} from 'console-table-printer';

export default class NodeListCommand extends BaseCommand {

  static description = 'List nodes of the cloud provider';

  static examples = [
    `$ cloud-provider node:list`,
  ]

  static flags = Object.assign({}, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(NodeListCommand);

    this.cloudProviderUrl = flags.url;

    const nodes = await this.getNodes();

    if (nodes.length > 0) {
      const nodeTableData = nodes.map(node => mapNode(node));
      printTable(nodeTableData);

    } else {
      console.log('The provider contains no node')
    }
  }
}
