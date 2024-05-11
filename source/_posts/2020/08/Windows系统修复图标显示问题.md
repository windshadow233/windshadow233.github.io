---
title: Windows系统修复图标显示问题
id: 4718
date: 2020-08-27 11:48:06
categories: [Debug]
tags: ['Windows']
cover: 
disableNunjucks: true
---

相信不少人都遇到过软件图标突然显示不了的问题，对于这种奇葩情况，我们可以用下面方法进行修复：


新建一个文本文档，内容是以下代码：


```bat
taskkill /f /im explorer.exe

attrib -h -i %userprofile%\AppData\Local\IconCache.db

del %userprofile%\AppData\Local\IconCache.db /a

start explorer
```

保存为.bat文件，双击运行即可解决问题。
