import { expect } from '@loopback/testlab';
import { APPLICATION_CONFIG } from '../../../../application-config';
import { Image, ImageVolume, InstanceAccount } from '../../../../models';
import { K8SRequestHelperService } from '../../../../services';

describe('K8SRequestHelperService', () => {

  it('returns null when no loader is specified', async () => {
    APPLICATION_CONFIG().kubernetes.requestHelper = undefined;

    const k8SRequestHelperService = new K8SRequestHelperService();
    const requestHelper = k8SRequestHelperService.getHelper();
    expect(requestHelper || null).to.be.null();
  });

  it('returns a helper with a relative path', async () => {
    APPLICATION_CONFIG().kubernetes.requestHelper = 'resources/__tests__/k8s-test-request-helper.js'

    const k8SRequestHelperService = new K8SRequestHelperService();
    const requestHelper = k8SRequestHelperService.getHelper();
    expect(requestHelper || null).to.not.be.null();
  });

  it('returns a helper with a absolute path', async () => {
    APPLICATION_CONFIG().kubernetes.requestHelper = `${__dirname}/../../../../../resources/__tests__/k8s-test-request-helper.js`

    const k8SRequestHelperService = new K8SRequestHelperService();
    const requestHelper = k8SRequestHelperService.getHelper();
    expect(requestHelper || null).to.not.be.null();
  });

  it('gets a volume from a request helper', async () => {
    APPLICATION_CONFIG().kubernetes.requestHelper = 'resources/__tests__/k8s-test-request-helper.js'

    const k8SRequestHelperService = new K8SRequestHelperService();
    const requestHelper = k8SRequestHelperService.getHelper();
    expect(requestHelper || null).to.not.be.null();

    const image = new Image({name: 'test', volumes: [new ImageVolume({name: 'volume1'}), new ImageVolume({name: 'volume2'})], });
    const account = new InstanceAccount({username: 'testuser', homePath: '/home/testuser'});

    const volumes = requestHelper.getVolumes(image, account);
    expect(volumes || null).to.not.be.null();
    expect(volumes.length).to.equal(2);
    expect(volumes[0].volumeMount.mountPath || null).to.not.be.null();
    expect(volumes[0].volumeMount.mountPath).to.equal('/home/testuser');
    expect(volumes[0].volume.hostPath || null).to.not.be.null();
    expect(volumes[0].volume.hostPath.path || null).to.not.be.null();
    expect(volumes[0].volume.hostPath.path).to.equal('/home/testuser');
    expect(volumes[1].volume.hostPath || null).to.not.be.null();
    expect(volumes[1].volume.hostPath.path || null).to.not.be.null();
    expect(volumes[1].volume.hostPath.path).to.equal('test');
  });

});
