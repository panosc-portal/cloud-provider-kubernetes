import { mapInstance } from '../../views/model.view'
import { printTable } from "console-table-printer";
import { InstanceCreatorDto, Flavour, Image, AccountCreatorDto } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';
const  os = require('os')

export default class InstanceAddCommand extends BaseCommand {

  static description = 'Adds an instance to the cloud provider'

  static examples = [
    `$ cloud-provider instance:add`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(InstanceAddCommand)
    
    this.cloudProviderUrl = flags.url;

    const flavours: Flavour[] = await this.getFlavours();
    const images: Image[] = await this.getImages();

    const validNumber = function (value: string) {
      const valid = !isNaN(Number(value));
      return valid || 'Please enter a number';
    }

    // Get account info for default account values
    const accountInfo = os.userInfo();

    const questions = [{
      type: 'list',
      name: 'imageId',
      message: 'Choose an image',
      validate: validNumber,
      filter: Number,
      choices: images.map(image => {
        return {
          name: `${image.name} ${image.description != null ? '(' + image.description + ')' : ''}`,
          value: image.id
        };
      })
    }, {
      type: 'list',
      name: 'flavourId',
      message: 'Choose a flavour',
      validate: validNumber,
      filter: Number,
      choices: flavours.map(flavour => {
        return {
          name: `${flavour.name} (${flavour.cpu} Cores, ${flavour.memory}MB RAM)`,
          value: flavour.id
        };
      })
    }, {
      type: 'input',
      name: 'name',
      message: 'Enter a name for the instance',
      validate: function (value: string) {
        return (value != null && value.length >= 4) || 'The name must be 4 or more characters long'
      }
    }, {
      type: 'input',
      name: 'description',
      message: 'Enter a description for the instance (optional)'
    }, {
      type: 'input',
      name: 'username',
      message: 'Enter a username for the account',
      default: accountInfo.username,
      validate: function (value: string) {
        return (value != null) || 'The name must not be null'
      }
    }, {
      type: 'input',
      name: 'userId',
      message: 'Enter a user ID for the account',
      default: 1,
      validate: validNumber,
      filter: Number
    }, {
      type: 'input',
      name: 'uid',
      message: 'Enter a UID for the account',
      default: accountInfo.uid,
      validate: validNumber,
      filter: Number
    }, {
      type: 'input',
      name: 'gid',
      message: 'Enter a GID for the account',
      default: accountInfo.gid,
      validate: validNumber,
      filter: Number
    }, {
      type: 'input',
      name: 'homePath',
      message: 'Enter a home path for the account',
      default: accountInfo.homedir,
      validate: function (value: string) {
        return (value != null) || 'The name must not be null'
      }
    }, {
      type: 'input',
      name: 'email',
      message: 'Enter a email for the account (optional)'
    }];

    try {
      const answers = await inquirer.prompt<{name: string, description: string, imageId: number, flavourId: number, username: string, userId: number, uid: number, gid: number, homePath: string, email: string}>(questions);

      const instanceCreator = new InstanceCreatorDto();
      instanceCreator.name = answers.name;
      instanceCreator.description = answers.description;
      instanceCreator.imageId = answers.imageId;
      instanceCreator.flavourId = answers.flavourId;

      const account = new AccountCreatorDto({userId: answers.userId, username: answers.username, uid: answers.uid, gid: answers.gid, homePath: answers.homePath, email: answers.email});
      instanceCreator.account = account;

      console.log(JSON.stringify(instanceCreator));

      console.log('Creating instance...');
      const instance = await this.createInstance(instanceCreator);
      console.log('... done');
      printTable([mapInstance(instance)]);
  
    } catch (error) {
      console.error(error.message);
    } 
  }
}
