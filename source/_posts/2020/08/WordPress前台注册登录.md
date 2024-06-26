---
title: WordPress前台注册登录
id: 3835
date: 2020-08-10 07:27:29
categories:
  - [博客相关]
tags: ['WordPress']
cover:
disableNunjucks: false
---

WP的原生的注册登录页面真的丑，而且会跳转离开主页，导致用户体验比较差，于是我打算实现一下在前台进行无跳转注册登录。


其实前台登录的插件有不少，但我不太想用插件，就自己来写咯~

由于并没有摸清WP注册登录的逻辑，自己写Authentication等函数可能安全性稍差一些，也会比较麻烦。（何况既然有已经写好的注册登录功能，为啥不用呢？）于是，我有了一个朴素的想法，即利用ajax向原生的注册登录页面（wp-login.php）post数据，通过判断返回的html页面数据来判断是否登录成功。

最终样式如图：

![efed423837f509f540938f769a99aac5](https://blogfiles.oss.fyz666.xyz/png/689b45b2-de0e-45b9-9380-b9ec5bb4255e.png)

前端代码：

{% link WordPress弹窗登录表单, GitHub Gist, https://gist.github.com/windshadow233/01873377a1b0f270027a1103c7d77ba3 %}


将其导入WordPress主题目录，修改一下路径参数即可！


思路比较简单，即失败时的页面必定会有个`#login_error`元素（有更好的判断方法敬请大佬们留言！！）


最后在前端页面加一个用以打开登录窗口的按钮（`onclick="openLogRe();"`）即可。
