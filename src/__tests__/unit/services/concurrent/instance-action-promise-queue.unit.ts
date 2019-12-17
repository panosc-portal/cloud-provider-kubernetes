import { expect } from '@loopback/testlab';
import { InstanceActionPromiseQueue } from '../../../../services/concurrent/instance-action-promise-queue';
import { InstanceAction, InstanceActionListener } from '../../../../services';
import { logger } from '../../../../utils';
import { InstanceCommandType, Instance } from '../../../../models';

class DummyInstanceAction extends InstanceAction {

  private _output: number;

  get output(): number {
    return this._output;
  }

  get type(): InstanceCommandType {
    return this._type;
  }

  get instanceId(): number {
    return this._id;
  }

  constructor(private _id: number, private _durationMS: number, private _input: number, private _type: InstanceCommandType, listener: InstanceActionListener) {
    super(null, null, null, listener);
  }

  protected _run(): Promise<void> {
    return new Promise((resolve, reject) => {
      logger.info(`action starting on action ${this._id}`);
      setTimeout(() => {
        this._output = this._input * this._input;
        logger.info(`action terminated on action ${this._id}`);
        resolve();
      }, this._durationMS);
    });
  }   
}


describe('InstanceActionPromiseQueue', () => {

  it('executes an action', async () => {
    const queue = new InstanceActionPromiseQueue();
    const action = new DummyInstanceAction(1, 200, 10, InstanceCommandType.CREATE, null);
    await queue.add(action);

    expect(action.output).to.equal(100);
    expect(queue.isActive).to.equal(false);
  });

  it('queues a different action', async () => {
    const queue = new InstanceActionPromiseQueue();

    const action1 = new DummyInstanceAction(1, 200, 10, InstanceCommandType.CREATE, null);
    const action2 = new DummyInstanceAction(2, 200, 20, InstanceCommandType.REBOOT, null);

    const promise1 = queue.add(action1);
    const promise2 = queue.add(action2);

    expect(queue.queueLength).to.equal(1);
    expect(queue.isActive).to.equal(true);

    await promise1;
    expect(action1.output).to.equal(100);
    expect(action2.output).to.be.undefined();
    expect(queue.queueLength).to.equal(0);
    expect(queue.isActive).to.equal(true);

    await promise2;
    expect(action2.output).to.equal(400);
    expect(queue.isActive).to.equal(false);
  });

  it('does not queue an identical action', async () => {
    const queue = new InstanceActionPromiseQueue();

    const action1 = new DummyInstanceAction(1, 200, 10, InstanceCommandType.CREATE, null);
    const action2 = new DummyInstanceAction(1, 200, 20, InstanceCommandType.CREATE, null);

    const promise1 = queue.add(action1);
    try {
      await queue.add(action2);
  
    } catch (error) {
      expect(error).to.not.be.null();
    }

    expect(queue.queueLength).to.equal(0);
    expect(queue.isActive).to.equal(true);
    
    await promise1;
  });

  it('calls back when empty', async () => {
    let callbackValue = 0;
    const queue = new InstanceActionPromiseQueue(function() {
      callbackValue = 1;
    });

    const action1 = new DummyInstanceAction(1, 200, 10, InstanceCommandType.CREATE, null);
    const action2 = new DummyInstanceAction(2, 200, 20, InstanceCommandType.REBOOT, null);

    const promise1 = queue.add(action1);
    const promise2 = queue.add(action2);

    expect(callbackValue).to.equal(0);
    await promise1;
    expect(callbackValue).to.equal(0);
    await promise2;
    expect(callbackValue).to.equal(1);
  });
});
