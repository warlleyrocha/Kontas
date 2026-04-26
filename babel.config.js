module.exports = function (api) {
  api.cache(true);
  const isMegler = process.env.MEGLER === 'true';

  const plugins = [];

  if (isMegler) {
    plugins.push([
      'module-resolver',
      {
        alias: {
          'react-native-worklets': './src/mocks/worklets.ts',
        },
      },
    ]);
  }

  return {
    presets: [
      ['babel-preset-expo', { jsxImportSource: 'nativewind' }],
      'nativewind/babel',
    ],
    plugins,
  };
};
