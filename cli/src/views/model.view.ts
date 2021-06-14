import {Instance, Image, Flavour, Node} from "../models"

export function mapInstance(instance: Instance): any {
  return {
    Id: instance.id,
    Name: instance.name,
    ComputeId: instance.computeId ? instance.computeId.substr(0, instance.computeId.indexOf('-', instance.computeId.indexOf('-') + 1) + 1) + '...' : '',
    Status: instance.state.status,
    Image: instance.image.name,
    Flavour: `${instance.flavour.name} (${instance.flavour.cpu} Cores, ${instance.flavour.memory}MB RAM)`,
    Host: instance.hostname,
    Protocols: instance.protocols ? instance.protocols.map(protocol => `${protocol.name} (${protocol.port})`).join(', ') : ''
  }
}

export function mapImage(image: Image): any {
  return {
    Id: image.id,
    Name: image.name,
    Type: image.environmentType,
    Repository: image.repository,
    Path: image.path,
    Command: image.command,
    Args: image.args,
    'Run As UID': image.runAsUID == null ? '' : '' + image.runAsUID,
    Protocols: image.protocols.map(imageProtocol => `${imageProtocol.protocol.name} (${imageProtocol.port ? imageProtocol.port : imageProtocol.protocol.defaultPort})`).join(', '),
    Volumes: image.volumes.map(imageVolume => `${imageVolume.name} (${imageVolume.path})`).join(', '),
    'Env Vars': image.envVars.map(imageEnvVar => `${imageEnvVar.name} (${imageEnvVar.value})`).join(', ')
  }
}

export function mapFlavour(flavour: Flavour): any {
  return {
    Id: flavour.id,
    Name: flavour.name,
    'CPU Cores': flavour.cpu,
    'Memory MB': flavour.memory
  }
}

export function mapNode(node: Node): any {
  return {
    Hostname: node.hostname,
    'Total CPU': node.cpus.total,
    'Available CPU': node.cpus.available,
    'Total Memory': node.memory.total,
    'Available Memory': node.memory.available,
  }
}
