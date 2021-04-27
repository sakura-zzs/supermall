module.exports = {
    configureWebpack: {
      resolve: {
            alias: {
            // 配置目录别名，@为默认设置的src目录的别名
          '@': 'src/',
          'components':'src/compontens'
        }
      }
    }
  }