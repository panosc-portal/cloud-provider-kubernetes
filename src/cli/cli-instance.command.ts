import { CloudProviderClient } from "./cloud-provider-client";
import { printTable } from "console-table-printer";
import { Image, Flavour } from "../models";
import { mapInstance, mapFlavour, mapImage } from "./cli-model.view";
import { InstanceCreatorDto } from "../controllers/dto/instance-creator-dto";
import * as inquirer from 'inquirer';

export class CliInstanceCommand {
  constructor(private _apiClient: CloudProviderClient) {
  }

  usage() {
    console.log('CLI Client for PaNOSC Cloud Provider');
    console.log('');
    console.log('Usage: cli instance [options]');
    console.log('');
    console.log('Options:');
    console.log('  list        List instances');
    console.log('  add         Add an instance');
  }

  async run(args: string[]): Promise<number> {
    if (args.length === 0) {
      this.usage();
      return 1;
    }

    let command = args[0];
    if (command === 'list') {
      await this._listInstances();
    } else if (command === 'add') {
      await this._addInstance();
    }
  
    return 0;
  }

  private async _listInstances() {
    const instances = await this._apiClient.getInstances();
    const instanceTableData = instances.map(instance => mapInstance(instance));

    // console.table(instanceTableData);
    printTable(instanceTableData);
  }

  private async _addInstance(): Promise<void> {
    const flavours: Flavour[] = await this._apiClient.getFlavours();
    const images: Image[] = await this._apiClient.getImages();

    const validNumber = function(value: string) {
      var valid = !isNaN(Number(value));
      return valid || 'Please enter a number';
    }

    const questions = [{
      type: 'list',
      name: 'imageId',
      message: 'Choose an image',
      validate: validNumber,
      filter: Number,
      choices: images.map(image => {
        return {
          name: `${image.name} ${image.description != null ? '(' + image.description + ')' : ''}`,
          value: image.id
        };
      })
    }, {
      type: 'list',
      name: 'flavourId',
      message: 'Choose a flavour',
      validate: validNumber,
      filter: Number,
      choices: flavours.map(flavour => {
        return {
          name: `${flavour.name} (${flavour.cpu} Cores, ${flavour.memory}MB RAM)`,
          value: flavour.id
        };
      })
    }, {
      type: 'input',
      name: 'name',
      message: 'Enter a name for the instance',
      validate: function(value: string) {
        return (value != null && value.length >= 4) || 'The name must be 4 or more characters long'
      }
    }, {
      type: 'input',
      name: 'description',
      message: 'Enter a description for the instance (optional)'
    }];

    try {
      const answers = await inquirer.prompt<{name: string, description: string, imageId: number, flavourId: number}>(questions);

      const instanceCreator = new InstanceCreatorDto();
      instanceCreator.name = answers.name;
      instanceCreator.description = answers.description;
      instanceCreator.imageId = answers.imageId;
      instanceCreator.flavourId = answers.flavourId;

      console.log('Creating instance...');
      const instance = await this._apiClient.createInstance(instanceCreator);
      console.log('... done');
      printTable([mapInstance(instance)]);
  
    } catch (error) {
      console.error(error.message);
    } 
  }
}