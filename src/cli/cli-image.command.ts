import { CloudProviderClient } from "./cloud-provider-client";
import { printTable } from "console-table-printer";
import { mapImage } from "./cli-model.view";

export class CliImageCommand {
  constructor(private _apiClient: CloudProviderClient) {
  }

  usage() {
    console.log('CLI Client for PaNOSC Cloud Provider');
    console.log('');
    console.log('Usage: cli image [options]');
    console.log('');
    console.log('Options:');
    console.log('  list        List images');
  }

  async run(args: string[]): Promise<number> {
    if (args.length === 0) {
      this.usage();
      return 1;
    }

    let command = args[0];
    if (command === 'list') {
      const images = await this._apiClient.getImages();

      const imageTableData = images.map(image => mapImage(image));

      printTable(imageTableData);
    }
  
    return 0;
  }
}