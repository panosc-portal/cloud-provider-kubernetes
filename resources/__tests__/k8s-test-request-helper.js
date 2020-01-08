const getVolumes = function (image, user) {
  const volumes =  [
    {
      name: 'volume1',
      data: {
        hostPath: {
          path: user.homePath,
          type: 'Directory'
        }
      }
    },
    {
      name: 'volume2',
      data: {
        hostPath: {
          path: process.env.NODE_ENV,
          type: 'Directory'
        }
      }
    }
  ];

  const volumeNames = image.volumes ? image.volumes.map(volume => volume.name) : [];
  return volumes.filter(volume => volumeNames.includes(volume.name)).map(volume => volume.data);
}

const getEnvVars = function (image, user) {
  const allEnvVars = [
    {
      imageName: 'image 1',
      data: [
        {name: 'NB_UID', value: user.uid},
        {name: 'NB_GID', value: user.gid}
      ]
    }
  ]

  const envVars = allEnvVars.find(envVars => envVars.imageName === image.name);
  return envVars == null ? null : envVars.data;
}

module.exports = {
  getVolumes: getVolumes,
  getEnvVars: getEnvVars
};


