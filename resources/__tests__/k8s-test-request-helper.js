const getVolumes = function(image, account) {
  const volumes = [
    {
      name: 'volume1',
      volumeMount: {
        mountPath: `/home/${account.username}`
      },
      volume: {
        hostPath: {
          path: account.homePath,
          type: 'Directory'
        }
      }
    }, {
      name: 'volume2',
      volume: {
        hostPath: {
          path: process.env.NODE_ENV,
          type: 'Directory'
        }
      }
    }, {
      name: 'volume3',
      volume: {
        hostPath: {
          path: '/tmp',
          type: 'Directory'
        }
      }
    }, {
      name: 'VOLUME4',
      volume: {
        hostPath: {
          path: '/test',
          type: 'Directory'
        }
      }
    }
  ];

    const volumeNames = image.volumes ? image.volumes.map(volume => volume.name) : [];
    return volumes.filter(volume => volumeNames.includes(volume.name));
  }
;

const getEnvVars = function(image, account) {
  const allEnvVars = [
    {
      imageName: 'image 1',
      data: [
        { name: 'NB_UID', value: `${account.uid}` },
        { name: 'NB_GID', value: `${account.gid}` }
      ]
    }, {
      imageName: 'image 2',
      data: [
        { name: 'NB_UID', value: `${account.uid}` },
        { name: 'NB_GID', value: `${account.gid}` }
      ]
    }
  ];

  const envVars = allEnvVars.find(someEnvVars => someEnvVars.imageName === image.name);
  return envVars? envVars.data : null;
};

const getRunAsUID = function(image, account) {
  const containerUIDs = [
    {
      imageName: 'image 2',
      runAsUID: account.uid
    }, {
      imageName: 'image 3',
      runAsUID: account.uid
    }
  ];

  const containerUID = containerUIDs.find(aContainerUID => aContainerUID.imageName === image.name);
  return containerUID ? containerUID.runAsUID : null;
};

module.exports = {
  getVolumes: getVolumes,
  getEnvVars: getEnvVars,
  getRunAsUID: getRunAsUID
};
;


