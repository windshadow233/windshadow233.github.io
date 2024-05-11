---
title: 如何应用Webpack来运行Vue项目
id: 5158
date: 2020-09-19 08:32:13
categories: [瞎捣鼓经历]
tags: ['NodeJS', 'npm', 'Vue', 'Webpack', '前端']
cover: 
disableNunjucks: true
---

Vue有多种导入方式，最常见的非模块化导入就是直接往网页里插入一个诸如这样的script标签：`<script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>`

但现在项目中一般看不见这种使用方法了，而大多使用模块化的导入方式。


但这些模块化导入命令的语法非浏览器所认可，直接在JS代码中使用会报错，而Webpack的作用简单而言就是将浏览器看不懂的代码转化为浏览器看得懂的代码。


## 简单创建一个web项目


首先创建一个web项目的文件夹（不妨命名为web），在其下创建一个index.html作为web项目的入口文件，再创建两个文件夹：src与dist，其中src用于存放开发过程中的源码，而dist用于存放项目发布时的代码。进入src文件夹，随意创建一个index.js作为JS入口文件。


以下所有操作都在web文件夹下进行。


## 初始化npm


依赖于Node.js环境

```bash
npm init
```

该命令会在当前路径生成一个`package.json`


## 安装Webpack


全局安装：

```bash
npm install webpack -g
```

局部安装：

```bash
npm install webpack --save-dev
```

### 配置Webpack


在web文件夹下创建一个webpack.config.js文件，写入以下内容：

```js
const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname ,'dist'),
    filename: 'bundle.js'
  }
}
```

entry定义为JS入口文件的路径，output定义为webpack打包文件的目标路径。


## 安装Vue


执行命令：

```bash
npm install vue --save
```

执行完毕后，当前文件夹下即出现一个新的文件夹：node_modules


## 正式在项目中使用Vue


举个简单的例子：

`./src/index.js`

```js
import Vue from 'vue'
const app = new Vue({
  el: '#app',
  template: `
    <div>
	<h2>{{message}}</h2>
    </div>
  `,
  data: function(){
    return{
      message: 'hello world'
    }
  }
})
```

./index.html



```markup
<!DOCTYPE html>
<html>
<head>
	<title></title>
</head>
<body>
    <div id="app">
    </div>
</body>
<script src="./src/index.js"></script>
```

然后直接在浏览器中访问index.html文件，但网页上啥都没有，打开console发现一句报错：`Uncaught SyntaxError: Cannot use import statement outside a module`。这其实就是因为浏览器无法理解`import Vue from 'vue'`这种模块化的导入语句。


这个时候就要用到webpack了，我们在命令行执行命令：

```bash
webpack
```

没错就这么简单，这是因为命令必需的参数我们已经预先在webpack.config.js中定义过了。


接下来修改./index.html最后一行为：

```markup
<script src="./dist/bundle.js"></script>
```

此时打开网页，仍有一行报错：

```raw
[Vue warn]: You are using the runtime-only build of Vue where the template compiler is not available....
```

这是因为默认导入的Vue是来自runtime-only的版本，该版本不支持代码中的template属性，对于这个问题，我们只需要修改`webpack.config.js`


在`module.exports`中添加一项与output并列的内容：

```js
resolve: {
  alias: {
    'vue$': 'vue/dist/vue.esm.js'
  }
}
```

再次执行命令`webpack`后，访问网页即可看到hello world字样。
