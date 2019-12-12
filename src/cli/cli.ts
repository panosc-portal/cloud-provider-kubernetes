import { CloudProviderClient } from "./cloud-provider-client";
import { CliInstanceCommand } from "./cli-instance.command";
import { CliImageCommand } from "./cli-image.command";

const client: CloudProviderClient = new CloudProviderClient('http://localhost:3000');

const args = process.argv.slice(2);

function usage() {
  console.log('CLI Client for PaNOSC Cloud Provider');
  console.log('');
  console.log('Usage: cli [options]');
  console.log('');
  console.log('Options:');
  console.log('  instance        Instance commands');
  console.log('  image           Image commands');
}

(async () => {
  let returnValue = 0;
  if (args.length == 0) {
    usage();
    returnValue = 1;

  } else {
    const command = args[0];
    if (command === 'instance') {
      returnValue = await new CliInstanceCommand(client).run(args.slice(1));
    
    } else if (command === 'image') {
      returnValue = await new CliImageCommand(client).run(args.slice(1));
    }
  }

  process.exit(returnValue);
  
})();

