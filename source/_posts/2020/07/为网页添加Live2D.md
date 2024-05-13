---
title: 为网页添加Live2D
id: 2032
date: 2020-07-19 05:49:54
categories:
  - [博客相关]
tags:
  - Web前端
cover: 
disableNunjucks: false
---

近期访问许多博客，常能发现网页的底部有一个萌萌的小人，能通过访客的鼠标移动点击与访客进行互动，本着遇到奇奇怪怪有意思的东西不管有没有用都要整一个的理念，我动用各方搜索资源，很快就整起来了，这里给一个添加小人的菜鸟教程。

这类小人例如你现在在网页右下角看到的是通过Live2D技术实现的，其只是在web端的一个应用，搭建容易，模型渲染与脚本编写不易，请多支持项目原作者！

项目来自GitHub仓库：

{%link live2d-widget,GitHub,https://github.com/stevenjoezhang/live2d-widget %}


项目文件目录结构：

```plaintext
│  message.json
│  README.md
│
└─Live2D
    ├─css
    │      live2d.css
    │
    ├─js
    │      live2d.js
    │      message.js
    │
    └─model
```

其中model文件夹包含了渲染的人物模型，不用管他。


将整个项目文件夹上传到网站的根目录，接下来导入到网页：

```markup
<link rel="stylesheet" type="text/css" href="/live2d/css/live2d.css">
<div id="landlord">
    <div class="message" style="opacity:0"></div>
    <!-- 设置人物显示的宽高 -->
    <canvas id="live2d" width="280" height="360" class="live2d"></canvas>
</div>
<script type="text/javascript">
    <!-- 设置message.json文件的父级路径 -->
    var message_Path = '/live2d/'
    var home_Path = window.location.origin + '/';
</script>
<script type="text/javascript" src="/live2d/js/live2d.js"></script>
<script type="text/javascript">
    //设置模型的配置文件路径,载入模型
    loadlive2d("live2d", "/live2d/model/tia/model.json");
</script>
<script type="text/javascript" src="/live2d/js/message.js"></script>
```

上面代码粘贴到网页上，修改几个路径参数就可以使用啦~


另外可以通过配置message.json文件，实现自定义的消息互动展示。


若网站内有ajax或JS动态加载，新加载的内容无法被自定义消息的选择器选中的情况，可以[参考此文](/blog/2036/)对message.js文件进行修改。
