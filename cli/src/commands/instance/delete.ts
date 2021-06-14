import { mapInstance } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { Instance } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class InstanceDeleteCommand extends BaseCommand {

  static description = 'Deletes an instance from the cloud provider'

  static examples = [
    `$ cloud-provider instance:delete`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(InstanceDeleteCommand)
    
    this.cloudProviderUrl = flags.url;

    const instances: Instance[] = await this.getInstances();

    if (instances.length > 0) {
      const questions = [{
        type: 'list',
        name: 'instanceId',
        message: 'Choose an instance to delete',
        filter: Number,
        choices: instances.map(instance => {
          return {
            name: `${instance.name} (id=${instance.id}, image=${instance.image.name}, status=${instance.state.status})`,
            value: instance.id
          };
        })
      }];
  
      try {
        const answers = await inquirer.prompt<{instanceId: number}>(questions);
  
        console.log(`Deleting instance ${answers.instanceId}...`);
        const instance = await this.deleteInstance(answers.instanceId);
        console.log('... done');
        printTable([mapInstance(instance)]);
    
      } catch (error) {
        console.error(error.message);
      } 

    } else {
      console.log('There are currently no instances');
    }
  }
}
