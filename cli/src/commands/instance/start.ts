import { mapInstance } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { Instance } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class InstanceStartCommand extends BaseCommand {

  static description = 'Starts an instance from the cloud provider'

  static examples = [
    `$ cloud-provider instance:start`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(InstanceStartCommand)
    
    this.cloudProviderUrl = flags.url;

    const instances: Instance[] = await this.getInstances();
    const activeInstances = instances.filter(instance => instance.state.status === 'STOPPED');
    if (activeInstances.length > 0) {
      const questions = [{
        type: 'list',
        name: 'instanceId',
        message: 'Choose an instance to start',
        filter: Number,
        choices: activeInstances.map(instance => {
          return {
            name: `${instance.name} (id=${instance.id}, image=${instance.image.name}, status=${instance.state.status})`,
            value: instance.id
          };
        })
      }];
  
      try {
        const answers = await inquirer.prompt<{instanceId: number}>(questions);
  
        console.log(`Starting instance ${answers.instanceId}...`);
        const instance = await this.startInstance(answers.instanceId);
        console.log('... done');
        printTable([mapInstance(instance)]);
    
      } catch (error) {
        console.error(error.message);
      } 
    
    } else {
      console.log('There are currently no stopped instances');
    }

  }
}
