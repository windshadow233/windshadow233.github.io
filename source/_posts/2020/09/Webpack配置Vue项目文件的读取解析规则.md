---
title: Webpack配置Vue项目文件的读取解析规则
id: 5162
date: 2020-09-19 16:37:49
categories: [瞎捣鼓经历]
tags: ['npm', 'Vue', 'Webpack', 'Web前端', 'NodeJS']
cover: 
disableNunjucks: true
---

Vue项目中使用webpack对文件进行打包时，由于.vue文件的特殊性，webpack一般无法正常对这类文件进行解析，我们可以通过以下方法对webpack进行配置：

打开`webpack.config.js`文件，在`module.exports`中加上以下内容：

```js
module: {
  rules: [
    {
      test: /.css$/,
      use: [ 'css-loader', 'style-loader' ]
    },
    {
      test: /.vue$/,
      use: [ 'vue-loader' ]
    }
  ]
},
```

当然仅仅这样添加是没有用的，我们还需要安装`css-loader`、`style-loader`、`vue-loader`与`vue-template-compiler`：

```bash
npm install css-loader style-loader vue-loader vue-template-compiler --save-dev
```

安装完以后运行webpack命令，若产生报错，在确保文件语法无错误的情况下，可以打开`package.json`文件查看一下`css-loader`、`style-loader`与`vue-loader`三者的版本，将版本降低一些即可，我使用的版本配置是：

```json
"css-loader": "^3.3.0",
"style-loader": "^1.0.0",
"vue-loader": "^13.0.0"，
```

修改完版本之后运行`npm install`即可让配置生效。


对于其他类型的文件，一般而言也可以下载到对应的loader，按以上方法进行配置即可。
