import { Image } from '../../models';
import * as inquirer from 'inquirer';
import { BaseCommand } from '../../utils';

export default class ImageDeleteCommand extends BaseCommand {

  static description = 'Deletes an image from the cloud provider'

  static examples = [
    `$ cloud-provider image:delete`,
  ]

  static flags = Object.assign({
  }, BaseCommand.baseFlags);

  async run() {
    const {args, flags} = this.parse(ImageDeleteCommand)
    
    this.cloudProviderUrl = flags.url;

    const images: Image[] = await this.getImages();

    const questions = [{
      type: 'list',
      name: 'imageId',
      message: 'Choose an image to delete',
      filter: Number,
      choices: images.map(image => {
        return {
          name: `${image.name} (id=${image.id}, ${image.repository != null && image.repository !== '' ? 'repository=' + image.repository + ', ' : ''}path=${image.path})`,
          value: image.id
        };
      })
    }];

    try {
      const answers = await inquirer.prompt<{imageId: number}>(questions);

      console.log(`Deleting image ${answers.imageId}...`);
      const done: boolean = await this.deleteImage(answers.imageId);
      if (done) {
        console.log('... done');

      } else {
        console.error('... failed');
      }
  
    } catch (error) {
      console.error(error.message);
    } 
  }
}
