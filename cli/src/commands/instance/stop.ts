import { mapInstance } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { Instance } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class InstanceStopCommand extends BaseCommand {

  static description = 'Stops an instance from the cloud provider'

  static examples = [
    `$ cloud-provider instance:stop`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(InstanceStopCommand)
    
    this.cloudProviderUrl = flags.url;

    const instances: Instance[] = await this.getInstances();
    const activeInstances = instances.filter(instance => instance.state.status === 'ACTIVE');
    if (activeInstances.length > 0) {
      const questions = [{
        type: 'list',
        name: 'instanceId',
        message: 'Choose an instance to stop',
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
  
        console.log(`Stopping instance ${answers.instanceId}...`);
        const instance = await this.stopInstance(answers.instanceId);
        console.log('... done');
        printTable([mapInstance(instance)]);
    
      } catch (error) {
        console.error(error.message);
      } 
    
    } else {
      console.log('There are currently no active instances');
    }

  }
}
