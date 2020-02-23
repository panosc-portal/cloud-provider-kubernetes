import { Image, InstanceAccount } from "../domain";

export interface IK8SRequestHelperVolumeData {
  name: string,
  volumeMount?: {
    mountPath: string,
    readOnly?: boolean
  },
  volume: any
}


export interface IK8SRequestHelper {

  getVolumes(image: Image, account: InstanceAccount): IK8SRequestHelperVolumeData[];
  getEnvVars(image: Image, account: InstanceAccount): {name: string, value: string}[];
  getRunAsUID(image: Image, account: InstanceAccount): number;
}
