---
title: Ajax或JS动态加载的dom元素无法响应jQuery选择器绑定事件的解决办法
id: 2036
date: 2020-07-19 05:47:06
categories:
    - [Debug]
    - [博客相关]
tags: ['JavaScript', 'Web前端']
cover: 
disableNunjucks: true
---

实现全站ajax后，首先遇到的问题就是动态加载的内容无法响应jQuery的事件绑定，例如若有如下jQuery代码：


```js
$('.btn').click(function (){
    //do something
});
```

后通过ajax或JavaScript动态加载了一个按钮：

```markup
<div class='btn'>点我</div>
```

点击该按钮应该不会有click事件响应。


网上许多博文指出可以使用`live`方法替换`on`方法，但我发现新版本的jQuery已经弃用这一方法了，不过也有新的替代方法，只要将前面的代码改成：

```js
$(document).on('click', '.btn', function (){
    //do something
});
```

这样未来被加载的元素也能响应jQuery绑定的事件。
