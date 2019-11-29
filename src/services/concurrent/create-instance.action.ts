import { InstanceCommand } from '../../models';
import { InstanceAction } from './instance.action';

export class CreateInstanceAction extends InstanceAction {
  constructor(instanceCommand: InstanceCommand) {
    super(instanceCommand);
  }

  protected _run(): Promise<void> {
    return new Promise<void>(function(resolve, reject) {
      console.log('run it');

      resolve();
    });
  }
}
