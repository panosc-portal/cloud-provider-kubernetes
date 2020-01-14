import { Image, InstanceUser } from "../domain";

export interface IK8SRequestHelperVolumeData {
  name: string,
  volumeMount?: {
    mountPath: string,
    readOnly?: boolean
  },
  volume: any
}


export interface IK8SRequestHelper {

  getVolumes(image: Image, user: InstanceUser): IK8SRequestHelperVolumeData[];
  getEnvVars(image: Image, user: InstanceUser): {name: string, value: string}[];
  getRunAsUID(image: Image, user: InstanceUser): number;
}
