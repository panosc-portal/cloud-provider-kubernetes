import { mapImage } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { ImageCreatorDto, Protocol, ImageVolumeCreatorDto, ImageProtocolCreatorDto, ImageEnvVarCreatorDto } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class ImageAddCommand extends BaseCommand {

  static description = 'Adds an image to the cloud provider'

  static examples = [
    `$ cloud-provider image:add`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(ImageAddCommand)
    
    this.cloudProviderUrl = flags.url;

    const protocols: Protocol[] = await this.getProtocols();
    
    const validNumber = function(value: string) {
      var valid = !isNaN(Number(value));
      return valid || 'Please enter a number';
    }

    const validNumberOrNull = function(value: string) {
      var valid = value === '' || value == null || !isNaN(Number(value));
      return valid || 'Please enter a number';
    }

    const questions = [{
      type: 'input',
      name: 'name',
      message: 'Enter a name for the image',
      validate: function(value: string) {
        return (value != null && value.length >= 4) || 'The name must be 4 or more characters long'
      }
    }, {
      type: 'input',
      name: 'repository',
      message: 'Enter the repository for the image (optional - docker hub used by default)',
    }, {
      type: 'input',
      name: 'path',
      message: 'Enter the path of the image',
    }, {
      type: 'list',
      name: 'environmentType',
      message: 'Choose an environment type',
      choices: ['REMOTE_DESKTOP', 'JUPYTER_NOTEBOOK']
    }, {
      type: 'input',
      name: 'command',
      message: 'Enter the command of the image (optional)',
    }, {
      type: 'input',
      name: 'args',
      message: 'Enter the args (separated by a comma, without spaces) of the image (optional)',
    }, {
      type: 'input',
      name: 'runAsUID',
      validate: validNumberOrNull,
      message: 'Enter the UID of the container security context (optional)',
    }, {
      type: 'checkbox',
      name: 'protocolIds',
      message: 'Select the protocols available on the image (the ports can be modified later)',
      choices: protocols.map(protocol => {
        return {
          name: `${protocol.name} (default port ${protocol.defaultPort})`,
          value: protocol.id
        };
      })
    }, {
      type: 'input',
      name: 'description',
      message: 'Enter a description for the image (optional)'
    }];

    try {
      const answers = await inquirer.prompt<{name: string, repository: string, path: string, environmentType: string, protocolIds: number[], command: string, args: string, runAsUID?: number, description: string}>(questions);

      // From selected protocols get port numbers
      const portAnswers = await inquirer.prompt(answers.protocolIds.map((protocolId: number) => {
        const protocol = protocols.find(protocol => protocol.id === protocolId);
        return {
          type: 'input',
          name: protocol.id,
          validate: validNumberOrNull,
          message: `Enter the port number for the ${protocol.name} protocol (will be ${protocol.defaultPort} by default)`,
        }
      }));

      const volumes = [];
      let addVolume = true;
      while (addVolume) {
        const addVolumeAnswer = await inquirer.prompt<{addVolume: boolean}>({
          type: 'confirm',
          name: 'addVolume',
          message: 'Add a volume? (y, N)',
          default: false
        });

        addVolume = addVolumeAnswer.addVolume;

        if (addVolume) {
          const volumeAnswers = await inquirer.prompt<{name: string, path: string, readOnly: boolean}>([{
            type: 'input',
            name: 'name',
            message: 'Enter the name for the volume',
            validate: function(value: string) {
              return (value != null) || 'The name must not be null'
            }
          }, {
            type: 'input',
            name: 'path',
            message: 'Enter the volume mount path inside the container',
            validate: function(value: string) {
              return (value != null) || 'The name must not be null'
            }
          }, {
            type: 'confirm',
            name: 'readOnly',
            message: 'Read-only volume? (y, N)',
            default: false
          }]);

          volumes.push(new ImageVolumeCreatorDto({name: volumeAnswers.name, path: volumeAnswers.path, readOnly: volumeAnswers.readOnly}));
        }
      }

      const envVars = [];
      let addEnvVar = true;
      while (addEnvVar) {
        const addEnvVarAnswer = await inquirer.prompt<{addEnvVar: boolean}>({
          type: 'confirm',
          name: 'addEnvVar',
          message: 'Add an environment variable? (y, N)',
          default: false
        });

        addEnvVar = addEnvVarAnswer.addEnvVar;

        if (addEnvVar) {
          const envVarAnswers = await inquirer.prompt<{name: string, path: string, readOnly: boolean}>([{
            type: 'input',
            name: 'name',
            message: 'Enter the name of the environment variable',
            validate: function(value: string) {
              return (value != null) || 'The name must not be null'
            }
          }, {
            type: 'input',
            name: 'value',
            message: 'Enter the value of the environment variable',
            validate: function(value: string) {
              return (value != null) || 'The name must not be null'
            }
          }]);

          envVars.push(new ImageEnvVarCreatorDto({name: envVarAnswers.name, value: envVarAnswers.value}));
        }
      }

      const imageCreator = new ImageCreatorDto();
      imageCreator.name = answers.name;
      imageCreator.description  = answers.description === '' ? undefined : answers.description
      imageCreator.repository = answers.repository === '' ? undefined : answers.repository;
      imageCreator.path = answers.path;
      imageCreator.environmentType = answers.environmentType;
      imageCreator.command = answers.command;
      imageCreator.args = answers.args;
      imageCreator.runAsUID = answers.runAsUID === '' ? undefined : +answers.runAsUID;
      imageCreator.protocols = answers.protocolIds.map((protocolId: number) => new ImageProtocolCreatorDto({protocolId: protocolId, port: portAnswers[protocolId] === '' ? undefined : +portAnswers[protocolId]}));
      imageCreator.volumes = volumes;
      imageCreator.envVars = envVars;

      console.log(JSON.stringify(imageCreator));

      console.log('Creating image...');
      const image = await this.createImage(imageCreator);
      console.log('... done');
      printTable([mapImage(image)]);
  
    } catch (error) {
      console.error(error.message);
    } 
  }
}
