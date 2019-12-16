import { K8sDeployment, K8sInstanceState, K8sService } from '.';
import { K8sInstanceStatus } from '../enumerations';
import { K8S_CREATING_TIMEOUT_S } from '../../utils';

enum K8sDeploymentStatus {
  UNKNOWN = 'UNKNOWN',
  BUILDING = 'BUILDING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
}

enum K8sServiceStatus {
  BUILDING = 'BUILDING',
  ACTIVE = 'ACTIVE',
  ERROR = 'ERROR',
}

interface K8sServiceState {
  status: K8sServiceStatus
  message: string
}

interface K8sDeploymentState {
  status: K8sDeploymentStatus
  message: string
}

export class K8sInstanceStatusHelper {

  static getK8sInstanceState(deployment: K8sDeployment, service: K8sService): K8sInstanceState {
    const deploymentState = K8sInstanceStatusHelper.getK8sDeploymentState(deployment);
    const deploymentStatus = deploymentState.status;
    if (deploymentStatus === 'ERROR') {
      return new K8sInstanceState(K8sInstanceStatus.ERROR, deploymentState.message);

    } else if (deploymentStatus === 'BUILDING') {
      return new K8sInstanceState(K8sInstanceStatus.BUILDING, deploymentState.message);

    } else if (deploymentStatus === 'UNKNOWN') {
      if (deploymentState.message) {
        return new K8sInstanceState(K8sInstanceStatus.UNKNOWN, deploymentState.message);

      } else {
        return new K8sInstanceState(K8sInstanceStatus.UNKNOWN);
      }

    } else if (deploymentStatus === 'ACTIVE') {
      const serviceState = K8sInstanceStatusHelper.getK8sServiceState(service, deployment);
      const serviceStatus = serviceState.status;
      if (serviceStatus === 'BUILDING') {
        return new K8sInstanceState(K8sInstanceStatus.BUILDING, serviceState.message);

      } else if (serviceStatus === 'ERROR') {
        return new K8sInstanceState(K8sInstanceStatus.ERROR, serviceState.message);

      } else if (serviceStatus === 'ACTIVE') {
        return new K8sInstanceState(K8sInstanceStatus.ACTIVE, 'Instance is active');
      }
    }

  }

  static getK8sServiceState(service: K8sService, deployment: K8sDeployment): K8sServiceState {
    const serviceEndpoint = service.endpoint;

    if (!service.hasEndpointData()) {
      return { status: K8sServiceStatus.BUILDING, message: 'Service endpoints have not been created yet' };

    } else if (serviceEndpoint && serviceEndpoint.length === 1) {
      const deploymentPorts = deployment.ports;
      const endpointsPorts = serviceEndpoint[0].ports;
      for (const deploymentPort of deploymentPorts) {
        if (endpointsPorts.find((p: any) => p.port === deploymentPort.containerPort) == null) {
          return {
            status: K8sServiceStatus.ERROR,
            message: `port ${deploymentPort.name} has not been mapped to the service`
          };
        }
      }
      return { status: K8sServiceStatus.ACTIVE, message: 'Service is active' };

    } else {
      return { status: K8sServiceStatus.ERROR, message: 'Service has no or too many endpoints ' };
    }
  }


  static getK8sDeploymentState(deployment: K8sDeployment): K8sDeploymentState {
    const status = deployment.status;
    if (status && status.conditions) {
      const conditions = status.conditions;
      const conditionAvailable = conditions.find(c => c.type === 'Available');
      if (conditionAvailable && conditionAvailable.status === 'True') {
        return { status: K8sDeploymentStatus.ACTIVE, message: 'Deployment active' };

      } else {
        return this.getK8sDeploymentPodsState(deployment);
      }

    } else {
      return { status: K8sDeploymentStatus.BUILDING, message: 'Deployment Building' };
    }

  }

  static getK8sDeploymentPodsState(deployment: K8sDeployment): K8sDeploymentState {
    if (!deployment.hasPods()) {
      return { status: K8sDeploymentStatus.BUILDING, message: 'Pods have not been created yet' };

    } else {
      const status = deployment.podStatus;
      const phase = status.phase;
      const conditions = status.conditions;

      switch (phase) {
        case 'Running':
          const conditionReady = conditions.find(c => c.type === 'Ready');

          if (conditionReady && conditionReady.status === 'False') {
            const containerWaitingState = status.containerStatuses[0].state.waiting;
            if (containerWaitingState.reason === 'CrashLoopBackOff') {
              return { status: K8sDeploymentStatus.ERROR, message: containerWaitingState.message };

            } else if (containerWaitingState.message) {
              return { status: K8sDeploymentStatus.UNKNOWN, message: containerWaitingState.message };

            } else {
              return { status: K8sDeploymentStatus.UNKNOWN, message: 'Unknown error' };
            }

          } else {
            return { status: K8sDeploymentStatus.ACTIVE, message: 'Service is active' };
          }
        case 'Pending':
          const conditionPodScheduled = conditions.find(c => c.type === 'PodScheduled');
          if (status.containerStatuses && status.containerStatuses[0]) {
            const containerWaitingState = status.containerStatuses[0].state.waiting;
            const reason = containerWaitingState.reason;
            if (reason === 'ImagePullBackOff' || reason === 'ErrImagePull') {
              return { status: K8sDeploymentStatus.ERROR, message: containerWaitingState.message };

            } else if (reason === 'ContainerCreating') {
              const podCreationTime = +new Date(deployment.podCreationTime);
              const currentTime = +new Date();
              const diff = Math.abs(currentTime - podCreationTime);
              const secondsRunning = Math.floor(diff / 1000);
              if (secondsRunning >= K8S_CREATING_TIMEOUT_S) {
                return { status: K8sDeploymentStatus.ERROR, message: 'Container creation timeout' };

              } else {
                return { status: K8sDeploymentStatus.BUILDING, message: reason };

              }

            } else if (containerWaitingState.message) {
              return { status: K8sDeploymentStatus.UNKNOWN, message: containerWaitingState.message };

            } else {
              return { status: K8sDeploymentStatus.UNKNOWN, message: 'Unknown error' };
            }

          } else if (conditionPodScheduled && conditionPodScheduled.status === 'False') {
            return { status: K8sDeploymentStatus.ERROR, message: conditionPodScheduled.message };

          } else {
            return { status: K8sDeploymentStatus.BUILDING, message: 'Building' };
          }
        default:
          return { status: K8sDeploymentStatus.UNKNOWN, message: 'Unknown error' };
      }
    }
  }
}


/*
    const mostRecentDate = new Date(Math.max.apply(null, statuses.map((e: any) => {
      return new Date(e.lastTransitionTime);
    })));

    const mostRecentObjects = statuses.filter((e: any) => {
      const d = new Date(e.lastTransitionTime);
      return d.getTime() === mostRecentDate.getTime();
    });

    const currentStatus = mostRecentObjects.find((object: any) => object.status === 'True');
    if (currentStatus != null) {
      const statusType = currentStatus.type.toLowerCase();
      switch (statusType) {
        case 'available':
          return { status: K8sDeploymentStatus.ACTIVE, message: currentStatus.message };
        case 'progressing':
          return { status: K8sDeploymentStatus.BUILDING, message: currentStatus.message };
        case 'replicafailure':
          return { status: K8sDeploymentStatus.ERROR, message: currentStatus.message };
        default:
          return { status: K8sDeploymentStatus.UNKNOWN };
      }

    } else {
      logger.warn(`Couldn't find a current status object`);
      return { status: K8sDeploymentStatus.UNKNOWN };
    }
  }*/
