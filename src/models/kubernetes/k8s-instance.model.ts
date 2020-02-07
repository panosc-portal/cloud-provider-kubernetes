import { K8sDeployment } from './k8s-deployment.model';
import { K8sService } from './k8s-service.model';
import { K8sInstanceState } from './k8s-instance-state.model';
import { K8sProtocol } from './k8s-protocol.model';
import { K8sInstanceStatusHelper } from './k8s-instance-status.helper';

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

  get namespace(): string {
    return this._namespace;
  }

  get state(): K8sInstanceState {
    return this._state;
  }

  get nodeName(): string {
    return this._deployment.podNodeName
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


  get hostname(): string {
    return this._hostname;
  }

  constructor(private _deployment: K8sDeployment, private _service: K8sService, private _computeId: string, private _namespace: string, private _hostname?: string) {
    this._state = K8sInstanceStatusHelper.getK8sInstanceState(this._deployment, this._service);
  }
}
