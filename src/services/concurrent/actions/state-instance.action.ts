import { InstanceCommand, InstanceState, InstanceStatus, K8sInstanceStatus } from '../../../models';
import { InstanceAction, InstanceActionListener } from './instance.action';
import { InstanceService } from '../../instance.service';
import { K8sInstanceService } from '../../kubernetes';
import { logger } from '../../../utils';
import * as isPortReachable from 'is-port-reachable';

export class StateInstanceAction extends InstanceAction {
  constructor(instanceCommand: InstanceCommand, instanceService: InstanceService, k8sInstanceService: K8sInstanceService, listener: InstanceActionListener) {
    super(instanceCommand, instanceService, k8sInstanceService, listener);
  }

  protected async _run(): Promise<void> {
    const instance = await this.getInstance();
    const currentInstanceStatus = instance.status;

    try {
      const computeId = instance.computeId;
      const namespace = instance.namespace;

      let nextInstanceState: InstanceState;
      let nodeName: string = null;
      let hostname: string = null;
      if (computeId == null || namespace == null) {
        if (currentInstanceStatus === InstanceStatus.DELETING) {
          nextInstanceState = new InstanceState({
            status: InstanceStatus.DELETED,
            message: 'Instance deleted',
            cpu: 0,
            memory: 0
          });

        } else {
          return;
        }

      } else {
        const k8sInstance = await this.k8sInstanceService.get(computeId, namespace);
        if (k8sInstance == null) {
          if (currentInstanceStatus !== InstanceStatus.REBOOTING && currentInstanceStatus !== InstanceStatus.STOPPING) {
            logger.warn(`K8S Instance with Id ${computeId} has been deleted on the server`);
          }

          nextInstanceState = new InstanceState({
            status: InstanceStatus.DELETED,
            message: 'Instance deleted',
            cpu: 0,
            memory: 0
          });

        } else {
          nextInstanceState = new InstanceState({
            status: this._convertStatus(currentInstanceStatus, k8sInstance.state.status),
            message: k8sInstance.state.message,
            cpu: k8sInstance.currentCpu,
            memory: k8sInstance.currentMemory
          });
          nodeName = k8sInstance.nodeName;
          hostname = k8sInstance.hostname;

          logger.debug(`Instance ${computeId} state: ${nextInstanceState.status} ${nextInstanceState.message}`);
        }

        // Handle mapping of states
        if (currentInstanceStatus === InstanceStatus.REBOOTING &&
          (nextInstanceState.status === InstanceStatus.BUILDING || nextInstanceState.status === InstanceStatus.DELETED)) {
          nextInstanceState.status = InstanceStatus.REBOOTING;
          nextInstanceState.message = 'Instance rebooting';

        } else if (currentInstanceStatus === InstanceStatus.STARTING && nextInstanceState.status === InstanceStatus.BUILDING) {
          nextInstanceState.status = InstanceStatus.STARTING;
          nextInstanceState.message = 'Instance starting';

        } else if (currentInstanceStatus === InstanceStatus.DELETING && nextInstanceState.status === InstanceStatus.ACTIVE) {
          nextInstanceState.status = InstanceStatus.DELETING;
          nextInstanceState.message = 'Instance deleting';

        } else if ((currentInstanceStatus === InstanceStatus.BUILDING || currentInstanceStatus === InstanceStatus.REBOOTING || currentInstanceStatus === InstanceStatus.STARTING) && nextInstanceState.status === InstanceStatus.ACTIVE) {
          // Check ports are open
          const portsOpenPromises = [];
          instance.protocols.forEach(protocol => {
            portsOpenPromises.push(isPortReachable(protocol.port, { host: hostname }));
          });

          const portsOpen = await Promise.all(portsOpenPromises);
          if (portsOpen.find(isOpen => !isOpen) != null) {
            logger.debug(`K8S Instance with Id ${computeId} is active but ports are not reachable`);
            nextInstanceState.status = InstanceStatus.STARTING;
          }
        }

        // Update ports if they have changed or haven't been set
        instance.protocols.forEach(async (protocol) => {
          if (protocol.internalPort === 0) {
            const k8sProtocol = k8sInstance.protocols.find(aK8sProtocol => aK8sProtocol.name.toUpperCase() === protocol.name);
            if (k8sProtocol && (k8sProtocol.externalPort != protocol.port || k8sProtocol.internalPort != protocol.internalPort)) {
              protocol.port = k8sProtocol.externalPort;
              protocol.internalPort = k8sProtocol.internalPort;
              await this.instanceService.instanceProtocolService.save(protocol);
            }
          }
        });
      }

      await this._updateInstance(nextInstanceState, hostname, nodeName);

    } catch (error) {
      logger.error(`Error getting state instance with Id ${instance.id}: ${error.message}`);
      throw error;
    }
  }
}
