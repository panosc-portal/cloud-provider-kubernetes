import { expect } from '@loopback/testlab';
import { PromiseQueue, logger } from '../../../utils';

describe('PromiseQueue', () => {

  it('sets up defaults correctly', async () => {
    const queue = new PromiseQueue();

    expect(queue.pendingLength).to.equal(0);
    expect(queue.queueLength).to.equal(0);
    expect(queue.maxPendingPromises).to.equal(1);
    expect(queue.maxQueuedPromises).to.equal(Infinity);
  });

  it('executes a promise', async () => {
    const queue = new PromiseQueue();
    const value = await queue.add(() => {
      return new Promise((resolve, reject) => {
        expect(queue.queueLength).to.equal(0);
        expect(queue.pendingLength).to.equal(1);
        logger.info('executing task 1');
        setTimeout(function () {
          logger.info('executed task 1');
          resolve(1);
        }, 200)
      });
    });

    expect(value).to.equal(1);
    expect(queue.pendingLength).to.equal(0);
  });

  it('queues a promise', async () => {
    const queue = new PromiseQueue();
    const promise1 = queue.add(() => {
      return new Promise((resolve, reject) => {
        expect(queue.queueLength).to.equal(0);
        expect(queue.pendingLength).to.equal(1);
        logger.info('executing task 1');
        setTimeout(function () {
          logger.info('executed task 1');
          resolve(1);
        }, 200)
      });
    });

    const promise2 = queue.add(() => {
      return new Promise((resolve, reject) => {
        expect(queue.queueLength).to.equal(0);
        expect(queue.pendingLength).to.equal(1);
        logger.info('executing task 2');
        setTimeout(function () {
          logger.info('executed task 2');
          resolve(2);
        }, 200)
      });
    });

    expect(queue.queueLength).to.equal(1);
    expect(queue.pendingLength).to.equal(1);

    const value1 = await promise1;
    const value2 = await promise2;

    expect(value1).to.equal(1);
    expect(value2).to.equal(2);
    expect(queue.pendingLength).to.equal(0);
  });

  it('executes promises in parallel', async () => {
    const queue = new PromiseQueue({maxPendingPromises: 2});
    const promise1 = queue.add(() => {
      return new Promise((resolve, reject) => {
        expect(queue.queueLength).to.equal(0);
        expect(queue.pendingLength).to.equal(1);
        logger.info('executing task 1');
        setTimeout(function () {
          logger.info('executed task 1');
          resolve(1);
        }, 200)
      });
    });

    const promise2 = queue.add(() => {
      return new Promise((resolve, reject) => {
        expect(queue.queueLength).to.equal(0);
        expect(queue.pendingLength).to.equal(2);
        logger.info('executing task 2');
        setTimeout(function () {
          logger.info('executed task 2');
          resolve(2);
        }, 100)
      });
    });

    expect(queue.queueLength).to.equal(0);
    expect(queue.pendingLength).to.equal(2);

    const value2 = await promise2;
    expect(queue.pendingLength).to.equal(1);
    const value1 = await promise1;

    expect(value1).to.equal(1);
    expect(value2).to.equal(2);
    expect(queue.pendingLength).to.equal(0);
  });

  it('calls back when empty', async () => {
    let callbackValue = 0;
    const queue = new PromiseQueue({onEmpty: function() {
      callbackValue = 1;
    }});
    const promise1 = queue.add(() => {
      return new Promise((resolve, reject) => {
        logger.info('executing task 1');
        setTimeout(function () {
          logger.info('executed task 1');
          resolve(1);
        }, 200)
      });
    });

    const promise2 = queue.add(() => {
      return new Promise((resolve, reject) => {
        logger.info('executing task 2');
        setTimeout(function () {
          logger.info('executed task 2');
          resolve(2);
        }, 200)
      });
    });

    expect(callbackValue).to.equal(0);
    await promise1;
    expect(callbackValue).to.equal(0);
    await promise2;
    expect(callbackValue).to.equal(1);
  });

});
