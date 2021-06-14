import { Flavour } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class FlavourDeleteCommand extends BaseCommand {

  static description = 'Deletes an flavour from the cloud provider'

  static examples = [
    `$ cloud-provider flavour:delete`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(FlavourDeleteCommand)
    
    this.cloudProviderUrl = flags.url;

    const flavours: Flavour[] = await this.getFlavours();

    const questions = [{
      type: 'list',
      name: 'flavourId',
      message: 'Choose a flavour to delete',
      filter: Number,
      choices: flavours.map(flavour => {
        return {
          name: `${flavour.name} (id=${flavour.id}, cpu=${flavour.cpu}, memory=${flavour.memory})`,
          value: flavour.id
        };
      })
    }];

    try {
      const answers = await inquirer.prompt<{flavourId: number}>(questions);

      console.log(`Deleting flavour ${answers.flavourId}...`);
      const done: boolean = await this.deleteFlavour(answers.flavourId);
      if (done) {
        console.log('... done');

      } else {
        console.error('... failed');
      }
  
    } catch (error) {
      console.error(error.message);
    } 
  }
}
