module.exports = {
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'test.com',
        extraResources: [
          { from: 'config', to: 'config' },
        ],
      },
    },
  },
};
