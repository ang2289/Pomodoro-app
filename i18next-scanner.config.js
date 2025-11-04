const path = require('path')

module.exports = {
  input: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!**/node_modules/**',
    '!dist/**',
  ],
  options: {
    removeUnusedKeys: false,
    debug: false,
    func: {
      list: ['t'],
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    trans: {
      component: 'Trans',
      i18nKey: 'i18nKey',
      defaultsKey: 'defaults',
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    },
    lngs: ['zh_TW', 'en_US'],
    defaultLng: 'zh_TW',
    defaultNs: 'translation',
    resource: {
      loadPath: path.join(__dirname, 'src/locales/{{lng}}.json'),
      savePath: path.join(__dirname, 'src/locales/{{lng}}.json')
    },
    nsSeparator: false,
    keySeparator: false,
    interpolation: { prefix: '{{', suffix: '}}' },
    defaultValue: (lng, ns, key) => {
      // 將 key 當作預設值，符合「zh-TW.json 加入相同字串」需求
      return key
    },
  },
}


