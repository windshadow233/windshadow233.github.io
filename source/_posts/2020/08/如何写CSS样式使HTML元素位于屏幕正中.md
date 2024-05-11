---
title: 如何写CSS样式使HTML元素位于屏幕正中
id: 3487
date: 2020-08-04 05:37:19
categories: [学习笔记]
tags: ['CSS', 'Web前端', '网站美化']
cover: 
disableNunjucks: true
---

在做前端时，往往会遇到将某个标签元素置于屏幕正中的需求，例如对话框等。这里提供一种利用CSS的方法，只需为目标元素添加以下CSS样式：


```css
position: fixed;
top: 50%;
left: 50%;
-webkit-transform: translateX(-50%) translateY(-50%);
-moz-transform: translateX(-50%) translateY(-50%);
-ms-transform: translateX(-50%) translateY(-50%);
transform: translateX(-50%) translateY(-50%);
```

即可让该元素始终位于屏幕正中。
