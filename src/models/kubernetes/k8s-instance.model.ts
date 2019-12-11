import { K8sDeployment } from './k8s-deployment.model';
import { K8sService } from './k8s-service.model';
import { K8sEndpoints } from './k8s-endpoints.model';
import { K8sInstanceState } from './k8s-instance-state.model';
import { K8sInstanceStatusHelper } from '../../services/kubernetes';
import { K8sProtocol } from './k8s-protocol.model';

export class K8sInstance {

  private readonly _state: K8sInstanceState;

  get deployment(): K8sDeployment {
    return this._deployment;
  }

  get service(): K8sService {
    return this._service;
  }

  get computeId(): string {
    return this._computeId;
  }

  get state(): K8sInstanceState {
    return this._state;
  }

  get hostname(): string {
    // TODO : get ip address of node master through node service
    return '';
  }

  get currentCpu(): number {
    // TODO : get current CPU 
    return 0;
  }

  get currentMemory(): number {
    // TODO : get current Memory 
    return 0;
  }

  get protocols(): K8sProtocol[] {
    const protocols = [];
    const servicePorts = this._service.ports;
    for (const servicePort of servicePorts) {
      const protocol = new K8sProtocol(servicePort.name, servicePort.port, servicePort.nodePort);
      protocols.push(protocol);
    }
    return protocols;
  }

  isValid() {
    return (
      this._deployment != null &&
      this._service != null &&
      this._endpoints != null

    );
  }

  constructor(private _deployment: K8sDeployment, private _service: K8sService, private _endpoints: K8sEndpoints, private _computeId: string) {
    this._state = K8sInstanceStatusHelper.getK8sInstanceState(this._deployment, this._endpoints);
  }
}
