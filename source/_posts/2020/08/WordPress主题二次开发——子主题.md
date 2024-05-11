---
title: WordPress主题二次开发——子主题
id: 4370
date: 2020-08-22 12:42:26
categories:
  - [博客相关]
tags: ['WordPress']
cover: 
disableNunjucks: true
---

在WP开发过程中，直接修改主题文件对主题进行美化是不妥的，因为若主题升级，一切又得重来，而子主题可以完美解决这一问题。子主题是指一个继承了另一个主题——父主题全部功能样式的主题，同时它允许你自己添加一些功能与样式。

创建一个子主题比较容易：


首先进入themes文件夹，该文件夹下放置了你全部的主题，找一个你希望继承的父主题文件夹，这里假设名为theme-parent，接下来创建子主题只需要两个步骤：


- 在themes文件夹下创建一个新文件夹，命名为theme-child（表示子主题的文件夹名，可任意命名）
- 进入子主题文件夹，创建一个文件：`style.css`，内容如下：


```css
/*!
Theme name:Theme-Child
Template:theme-parent
*/
@import url('../theme-parent/style.css')
```

Theme name后面内容是你的子主题名称，Template后面填写父主题文件夹名，下面的url修改成父主题下的style.css的相对路径。


此时子主题已经制作完成，它和父主题一毛一样，因为我们没有加任何新的内容。若想加入新的函数，只需在子主题文件夹下创建一个functions.php文件，里面写入函数即可。


返回子主题文件路径的函数：`get_stylesheet_directory()`


返回子主题URI的函数：`get_stylesheet_directory_uri('template_url')`
