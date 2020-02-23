import { Image, InstanceAccount, IK8SRequestHelperVolumeData, IK8SRequestHelper } from "../../models";
import { APPLICATION_CONFIG } from "../../application-config";
import { logger } from "../../utils/logger";

export class K8SRequestHelperService {

  private _requestHelper: IK8SRequestHelper = null;

  getHelper(): IK8SRequestHelper {
    if (this._requestHelper == null) {
      const requestHelperPath = APPLICATION_CONFIG().kubernetes.requestHelper;
      if (requestHelperPath != null) {
        try {
          let fullPath = requestHelperPath;
          if (!requestHelperPath.startsWith('/')) {
            fullPath = `../../../${requestHelperPath}`;
          }
          const requestHelper = require(fullPath) as IK8SRequestHelper;
          this._requestHelper = requestHelper;
    
        } catch (error) {
          logger.error(`Could not load K8SRequestHelper with the file path '${requestHelperPath}'`);
        }
      }
    }

    return this._requestHelper;
  }

  getAndValidateHelper(image: Image, user: InstanceAccount) {
    this.getHelper();
    if (this._requestHelper && this.validateHelper(image, user)) {
      return this._requestHelper;
    }

    return null;
  }

  validateHelper(image: Image, user: InstanceAccount) {
    try {
      const volumes: IK8SRequestHelperVolumeData[] = this._requestHelper.getVolumes ? this._requestHelper.getVolumes(image, user) || [] : [];
      const envVars: {name: string, value: string}[] = this._requestHelper.getEnvVars ? this._requestHelper.getEnvVars(image, user) || [] : [];
      const runAsUID = this._requestHelper.getRunAsUID ? this._requestHelper.getRunAsUID(image, user) : null;

      volumes.forEach(volume => {
        if (volume.name == null) {
          throw new Error(`K8SRequestHelper at '${APPLICATION_CONFIG().kubernetes.requestHelper}' must provides names for each volume`);
        }
        if (volume.volume == null) {
          throw new Error(`K8SRequestHelper at '${APPLICATION_CONFIG().kubernetes.requestHelper}' does not provide a 'volume' entity for volume '${volume.name}'`);
        }
        if (volume.volumeMount != null) {
          if (volume.volumeMount.mountPath == null) {
            throw new Error(`K8SRequestHelper at '${APPLICATION_CONFIG().kubernetes.requestHelper}' does not provide a 'volumeMount.mountPath' entity for volume '${volume.name}'`);
          }
          if (volume.volumeMount.readOnly != null && typeof volume.volumeMount.readOnly !== 'boolean') {
            throw new Error(`K8SRequestHelper at '${APPLICATION_CONFIG().kubernetes.requestHelper}' must does not provide a 'volumeMount.readOnly' that is of boolean type for volume '${volume.name}'`);
          }
        }
      })

      envVars.forEach(envVar => {
        if (envVar.name == null) {
          throw new Error(`K8SRequestHelper at '${APPLICATION_CONFIG().kubernetes.requestHelper}' must provides names for each environment variable`);
        }
        if (envVar.value == null) {
          throw new Error(`K8SRequestHelper at '${APPLICATION_CONFIG().kubernetes.requestHelper}' must provides values for each environment variable`);
        }
      })

      if (runAsUID != null && typeof runAsUID !== 'number') {
        throw new Error(`K8SRequestHelper at '${APPLICATION_CONFIG().kubernetes.requestHelper}' must provides run-as-UIDs that are numeric`);
      }

      return true;

    } catch (error) {
      logger.error(error.message);
      return false;
    }
  }
}
