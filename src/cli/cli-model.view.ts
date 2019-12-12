import { Instance, Image, Flavour } from "../models"

export function mapInstance(instance: Instance): any {
  return {
    Id: instance.id,
    Name: instance.name,
    ComputeId: instance.computeId,
    Status: instance.status,
    'Image name': instance.image.name,
    'Flavour name': instance.flavour.name,
    'CPU Max': instance.flavour.cpu,
    'Memory Max': instance.flavour.memory,
    Host: instance.hostname,
    Protocols: instance.protocols ? instance.protocols.map(protocol => `${protocol.name} (${protocol.port})`).join(', ') : ''
  }
}

export function mapImage(image: Image): any {
  return {
    Id: image.id,
    Name: image.name,
    Path: image.path,
    Protocols: image.protocols.map(protocol => `${protocol.name} (${protocol.port})`).join(', ')
  }
}

export function mapFlavour(flavour: Flavour): any {
  return {
    Id: flavour.id,
    Name: flavour.name,
    CPU: flavour.cpu,
    Memory: flavour.memory
  }
}
