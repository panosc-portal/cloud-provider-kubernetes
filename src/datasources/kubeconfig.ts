import { APPLICATION_CONFIG } from '../application-config';
import * as fs from 'fs';
import { K8sSecret, K8sSecretRequestConfig } from '../models/kubernetes';
import { logger } from '../utils';

interface K8SCertificateConfig {
  certificateAuthority: string;
  clientCertificate: string;
  clientKey: string;
}

export class K8SConfigCreator {
  config: any;
  private _certificateConfig: K8SCertificateConfig;

  constructor() {
    if (APPLICATION_CONFIG().kubernetes.certificatesConfig != null) {
      const certificatesFile = APPLICATION_CONFIG().kubernetes.certificatesConfig;
      if (fs.existsSync(certificatesFile)) {
        try {
          const data = fs.readFileSync(certificatesFile);
          this._certificateConfig = JSON.parse(data.toString());


        } catch (error) {
          logger.error(`Unable to read certificates config file '${certificatesFile}': ${error.message}`);
        }

      } else {
        logger.warn(`No certificates config file has been provided`);
      }
    }

  }

  getConfig(): any {

    const config = {
      apiVersion: 'v1',
      clusters: [
        {
          name: APPLICATION_CONFIG().kubernetes.clusterName,
          cluster: {
            server: `${APPLICATION_CONFIG().kubernetes.protocol}://${APPLICATION_CONFIG().kubernetes.host}:${APPLICATION_CONFIG().kubernetes.port}`,
            'certificate-authority-data': this._certificateConfig ? this._certificateConfig.certificateAuthority : undefined
          }
        }
      ],
      users: [
        {
          name: APPLICATION_CONFIG().kubernetes.userName,
          user: this._certificateConfig ? {
            'client-certificate-data': this._certificateConfig.clientCertificate,
            'client-key-data': this._certificateConfig.clientKey
          } : undefined
        }
      ],
      contexts: [
        {
          name: APPLICATION_CONFIG().kubernetes.contextName,
          context: {
            cluster: APPLICATION_CONFIG().kubernetes.clusterName,
            user: APPLICATION_CONFIG().kubernetes.userName
          }
        }
      ],
      'current-context': APPLICATION_CONFIG().kubernetes.contextName
    };

    return config;
  }

}
