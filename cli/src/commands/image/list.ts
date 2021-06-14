import { mapImage } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { BaseCommand } from '../../utils';

export default class ImageListCommand extends BaseCommand {

  static description = 'List images of the cloud provider'

  static examples = [
    `$ cloud-provider image:list`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(ImageListCommand)
    
    this.cloudProviderUrl = flags.url;

    const images = await this.getImages();

    if (images.length > 0) {
      const imageTableData = images.map(image => mapImage(image));

      printTable(imageTableData);
      
    } else {
      console.log('The provider contains no images');
    }
  }
}
