import { expect } from '@loopback/testlab';
import { createTestApplicationContext } from '../../../helpers/context.helper';
import { K8sDeploymentManager, K8sNamespaceManager, InstanceService } from '../../../../services';
import { K8sDeploymentRequest } from '../../../../models';
import { KubernetesMockServer } from '../../../mock/kubernetes-mock-server';
import { givenInitialisedTestDatabase } from '../../../helpers/database.helper';
import { APPLICATION_CONFIG } from '../../../../application-config';
import { K8SRequestHelperLoader } from '../../../../utils';

describe('K8sDeploymentManager', () => {
  let k8sNamespaceManager: K8sNamespaceManager;
  let k8sDeploymentManager: K8sDeploymentManager;
  let instanceService: InstanceService;
  const kubernetesMockServer = new KubernetesMockServer();

  before('getK8sDeploymentManager', async () => {
    const testApplicationContext = createTestApplicationContext();
    k8sNamespaceManager = testApplicationContext.k8sInstanceService.namespaceManager;
    k8sDeploymentManager = testApplicationContext.k8sInstanceService.deploymentManager;
    instanceService = testApplicationContext.instanceService;
  });

  beforeEach('startMockServer', async () => {
    await givenInitialisedTestDatabase();
    kubernetesMockServer.start();
  });

  afterEach('stopMockServer', async () => {
    kubernetesMockServer.stop();
  });

  it('create kubernetes deployment', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance || null).to.not.be.null();

    const k8sDeployment = await k8sDeploymentManager.create(instance, 'test', 'panosc');
    expect(k8sDeployment || null).to.not.be.null();
    expect(k8sDeployment.name).to.be.equal('test');
  });

  it('creates kubernetes deployment request with expected ports', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance || null).to.not.be.null();

    const k8sDeploymentRequest = new K8sDeploymentRequest({
      name: 'test',
      image: instance.image,
      flavour: instance.flavour,
      user: instance.user
    });
    expect(k8sDeploymentRequest.model.spec.template.spec.containers[0].ports.length).to.equal(2);
  });

  it('creates kubernetes deployment with expected ports', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance || null).to.not.be.null();

    const k8sDeployment = await k8sDeploymentManager.create(instance, 'test', 'panosc');
    expect(k8sDeployment || null).to.not.be.null();

    expect(k8sDeployment.ports.length).to.equal(2);

    const portNumbers = k8sDeployment.ports.map(port => port.containerPort);
    expect(portNumbers.includes(3389)).to.be.true();
    expect(portNumbers.includes(22)).to.be.true();
  });

  it('get a non existing deployment', async () => {
    const k8sDeployment = await k8sDeploymentManager.getWithComputeId('test', 'panosc');
    expect(k8sDeployment || null).to.be.null();
  });

  it('create and get kubernetes deployment', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance || null).to.not.be.null();

    await k8sDeploymentManager.create(instance, 'test', 'panosc');
    const k8sDeployment = await k8sDeploymentManager.getWithComputeId('test', 'panosc');
    expect(k8sDeployment || null).to.not.be.null();
    expect(k8sDeployment.name).to.be.equal('test');
  });

  it('create two kubernetes deployment with same name', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance || null).to.not.be.null();

    await k8sDeploymentManager.create(instance, 'test', 'panosc');
    let k8sDeployment2 = null;
    try {
      k8sDeployment2 = await k8sDeploymentManager.create(instance, 'test', 'panosc');
    } catch (error) {
      // Expect an error rather than returning null
    }
    expect(k8sDeployment2 || null).to.be.null();
  });

  it('delete an inexistent deployment', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace || null).to.not.be.null();

    const deletedDeployment = await k8sDeploymentManager.deleteWithComputeId('test', 'panosc');
    expect(deletedDeployment).to.be.false();
  });

  it('create and delete a deployment', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance || null).to.not.be.null();

    await k8sDeploymentManager.create(instance, 'test', 'panosc');
    const deletedService = await k8sDeploymentManager.deleteWithComputeId('testdeployment', 'panosc');
    expect(deletedService).to.be.not.null();
  });

  it('creates kubernetes deployment request with a volume mount', async () => {
    const instance = await instanceService.getById(1);
    expect(instance || null).to.not.be.null();
    expect(instance.image.command || null).to.not.be.null();
    expect(instance.image.args || null).to.not.be.null();

    const deploymentRequest = new K8sDeploymentRequest({
      name: instance.computeId,
      image: instance.image,
      flavour: instance.flavour,
      user: instance.user
    });
    expect(deploymentRequest.model.spec.template.spec.containers || null).to.not.be.null();
    expect(deploymentRequest.model.spec.template.spec.containers.length).to.equal(1);
    expect(deploymentRequest.model.spec.template.spec.containers[0].volumeMounts || null).to.not.be.null();
    expect(deploymentRequest.model.spec.template.spec.containers[0].volumeMounts.length).to.equal(1);
    expect(deploymentRequest.model.spec.template.spec.containers[0].volumeMounts[0].name).to.equal('volume1');
    expect(deploymentRequest.model.spec.template.spec.containers[0].volumeMounts[0].mountPath).to.equal('/path');
    expect(deploymentRequest.model.spec.template.spec.containers[0].volumeMounts[0].readOnly).to.equal(false);
  });

  it('creates kubernetes deployment request with command and args', async () => {
    const instance = await instanceService.getById(1);
    expect(instance || null).to.not.be.null();
    expect(instance.image.command || null).to.not.be.null();
    expect(instance.image.args || null).to.not.be.null();

    const deploymentRequest = new K8sDeploymentRequest({
      name: instance.computeId,
      image: instance.image,
      flavour: instance.flavour,
      user: instance.user
    });
    expect(deploymentRequest.model.spec.template.spec.containers || null).to.not.be.null();
    expect(deploymentRequest.model.spec.template.spec.containers.length).to.equal(1);
    expect(deploymentRequest.model.spec.template.spec.containers[0].command || null).to.not.be.null();
    expect(deploymentRequest.model.spec.template.spec.containers[0].command.length).to.equal(1);
    expect(deploymentRequest.model.spec.template.spec.containers[0].command[0]).to.equal('start.sh');
    expect(deploymentRequest.model.spec.template.spec.containers[0].args || null).to.not.be.null();
    expect(deploymentRequest.model.spec.template.spec.containers[0].args.length).to.equal(3);
    expect(deploymentRequest.model.spec.template.spec.containers[0].args[0]).to.equal('jupyter');
    expect(deploymentRequest.model.spec.template.spec.containers[0].args[1]).to.equal('notebook');
    expect(deploymentRequest.model.spec.template.spec.containers[0].args[2]).to.equal(`--NotebookApp.token=''`);
  });

  it('creates kubernetes deployment request with volumes from request helper', async () => {
    APPLICATION_CONFIG().kubernetes.requestHelper = 'resources/__tests__/k8s-test-request-helper.js';

    const requestHelper = K8SRequestHelperLoader.getHelper();
    expect(requestHelper || null).to.not.be.null();

    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance || null).to.not.be.null();
    expect(instance.image.volumes || null).to.not.be.null();
    expect(instance.image.volumes.length).to.equal(1);
    expect(instance.image.volumes[0].name).to.equal('volume1');

    const deploymentRequest = new K8sDeploymentRequest({
      name: instance.computeId,
      image: instance.image,
      flavour: instance.flavour,
      user: instance.user,
      helper: requestHelper
    });
    expect(deploymentRequest.model.spec.template.spec.volumes || null).to.not.be.null();
    expect(deploymentRequest.model.spec.template.spec.volumes.length).to.equal(1);
    expect(deploymentRequest.model.spec.template.spec.volumes[0].hostPath.path).to.equal('/home/bloggs');
  });

  it('creates kubernetes deployment request with env vars from request helper', async () => {
    APPLICATION_CONFIG().kubernetes.requestHelper = 'resources/__tests__/k8s-test-request-helper.js';

    const requestHelper = K8SRequestHelperLoader.getHelper();
    expect(requestHelper || null).to.not.be.null();

    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance || null).to.not.be.null();
    expect(instance.image.name).to.equal('image 1');

    const deploymentRequest = new K8sDeploymentRequest({
      name: instance.computeId,
      image: instance.image,
      flavour: instance.flavour,
      user: instance.user,
      helper: requestHelper
    });
    expect(deploymentRequest.model.spec.template.spec.containers || null).to.not.be.null();
    expect(deploymentRequest.model.spec.template.spec.containers.length).to.equal(1);
    expect(deploymentRequest.model.spec.template.spec.containers[0].env || null).to.not.be.null();
    expect(deploymentRequest.model.spec.template.spec.containers[0].env.length).to.equal(2);
    expect(deploymentRequest.model.spec.template.spec.containers[0].env[0].name).to.equal('NB_UID');
    expect(deploymentRequest.model.spec.template.spec.containers[0].env[0].value).to.equal(`${instance.user.uid}`);
    expect(deploymentRequest.model.spec.template.spec.containers[0].env[1].name).to.equal('NB_GID');
    expect(deploymentRequest.model.spec.template.spec.containers[0].env[1].value).to.equal(`${instance.user.gid}`);
  });

  it('creates kubernetes deployment with a volume mount', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(1);
    await k8sDeploymentManager.create(instance, 'test', 'panosc');
    const k8sDeployment = await k8sDeploymentManager.getWithComputeId('test', 'panosc');
    expect(k8sDeployment.containers[0].volumeMounts.filter(volumeMounts => volumeMounts.name == 'volume1') || null).to.not.be.null();
  });

  it('creates kubernetes deployment with database and helper env vars', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace).to.not.be.null();

    const instance = await instanceService.getById(2);
    await k8sDeploymentManager.create(instance, 'test', 'panosc');
    const k8sDeployment = await k8sDeploymentManager.getWithComputeId('test', 'panosc');
    expect(k8sDeployment.containers[0].env.length).to.equal(3);
    expect(k8sDeployment.containers[0].env.find(envVar => envVar.name == 'NB_UID').value).to.be.equal(`${1001}`);
    expect(k8sDeployment.containers[0].env.find(envVar => envVar.name == 'NB_GID').value).to.be.equal(`${2000}`);
    expect(k8sDeployment.containers[0].env.find(envVar => envVar.name == 'TEST').value).to.be.equal('Test value');
  });

  it('creates kubernetes deployment with database env vars', async () => {
    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace).to.not.be.null();

    const instance = await instanceService.getById(6);
    await k8sDeploymentManager.create(instance, 'test', 'panosc');
    const k8sDeployment = await k8sDeploymentManager.getWithComputeId('test', 'panosc');
    expect(k8sDeployment.containers[0].env.length).to.equal(3);
    expect(k8sDeployment.containers[0].env.find(envVar => envVar.name == 'NB_UID').value).to.be.equal('3000');
    expect(k8sDeployment.containers[0].env.find(envVar => envVar.name == 'NB_GID').value).to.be.equal('3001');
    expect(k8sDeployment.containers[0].env.find(envVar => envVar.name == 'TEST').value).to.be.equal('Test value 2');
  });

  it('creates kubernetes deployment request with protocols', async () => {

    const requestHelper = K8SRequestHelperLoader.getHelper();
    expect(requestHelper || null).to.not.be.null();

    const k8sNamespace = await k8sNamespaceManager.create('panosc');
    expect(k8sNamespace || null).to.not.be.null();

    const instance = await instanceService.getById(1);
    expect(instance || null).to.not.be.null();
    expect(instance.image.name).to.equal('image 1');

    const deploymentRequest = new K8sDeploymentRequest({
      name: instance.computeId,
      image: instance.image,
      flavour: instance.flavour,
      user: instance.user,
      helper: requestHelper
    });
    expect(deploymentRequest.model.spec.template.spec.containers[0].ports.length).to.equal(2);
    expect(deploymentRequest.model.spec.template.spec.containers[0].ports[0].name ).to.equal('ssh');
    expect(deploymentRequest.model.spec.template.spec.containers[0].ports[0].containerPort).to.equal(22);
    expect(deploymentRequest.model.spec.template.spec.containers[0].ports[1].name).to.equal('rdp');
    expect(deploymentRequest.model.spec.template.spec.containers[0].ports[1].containerPort).to.equal(3389);
  });
});
