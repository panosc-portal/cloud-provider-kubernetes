import { mapFlavour } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { FlavourCreatorDto } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class FlavourAddCommand extends BaseCommand {

  static description = 'Adds a flavour to the cloud provider'

  static examples = [
    `$ cloud-provider flavour:add`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(FlavourAddCommand)
    
    this.cloudProviderUrl = flags.url;

    const validNumber = function(value: string) {
      var valid = !isNaN(Number(value));
      return valid || 'Please enter a number';
    }

    const questions = [{
      type: 'input',
      name: 'name',
      message: 'Enter a name for the flavour',
      validate: function(value: string) {
        return (value != null && value.length >= 4) || 'The name must be 4 or more characters long'
      }
    }, {
      type: 'input',
      name: 'cpu',
      filter: Number,
      message: 'Enter the number of CPUs for the flavour',
      validate: validNumber
    }, {
      type: 'input',
      name: 'memory',
      filter: Number,
      message: 'Enter the memory (MB) for the flavour',
      validate: validNumber
    }, {
      type: 'input',
      name: 'description',
      message: 'Enter a description for the flavour (optional)'
    }];

    try {
      const answers = await inquirer.prompt<{name: string, cpu: number, memory: number, description: string}>(questions);

      const flavourCreator = new FlavourCreatorDto();
      flavourCreator.name = answers.name;
      flavourCreator.description = answers.description;
      flavourCreator.cpu = answers.cpu;
      flavourCreator.memory = answers.memory;

      console.log(JSON.stringify(flavourCreator));

      console.log('Creating flavour...');
      const flavour = await this.createFlavour(flavourCreator);
      console.log('... done');
      printTable([mapFlavour(flavour)]);
  
    } catch (error) {
      console.error(error.message);
    } 
  }
}
