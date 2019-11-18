import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {
  RestExplorerBindings,
  RestExplorerComponent,
} from '@loopback/rest-explorer';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import * as path from 'path';
import {MySequence} from './sequence';
import {
  FlavourService,
  HealthService,
  ImageService,
  InfoService,
  InstanceService,
  MetricsService,
  NodeService,
} from './services';
import {FlavourRepository, ImageRepository, InstanceRepository} from './repositories';
import {PostgresDataSource} from './datasources';


export class CloudproviderApiKubernetesApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);

    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.bind(RestExplorerBindings.CONFIG).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.bind('flavour-service').toClass(FlavourService);
    this.bind('image-service').toClass(ImageService);
    this.bind('instance-service').toClass(InstanceService);
    this.bind('node-service').toClass(NodeService);
    this.bind('metrics-service').toClass(MetricsService);
    this.bind('health-service').toClass(HealthService);
    this.bind('info-service').toClass(InfoService);

    this.bind('image-repository').toClass(ImageRepository);
    this.bind('flavour-repository').toClass(FlavourRepository);
    this.bind('instance-repository').toClass(InstanceRepository);
    this.bind('datasources.postgreSQL').toClass(PostgresDataSource);


    this.basePath('/api/v1');


    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
}
