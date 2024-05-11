---
title: npm源修改
id: 5156
date: 2020-09-19 07:32:44
categories: [学习笔记]
tags: ['npm']
cover: 
disableNunjucks: false
---

在使用npm安装项目时，默认源在国外，导致速度贼慢甚至安装失败，这时可以通过以下命令修改源：

{%tabs tab1%}

<!-- tab 临时修改 -->

```bash
npm --registry https://registry.npm.taobao.org install xxx
```

<!-- endtab -->

<!-- tab 永久修改 -->

```bash
npm config set registry https://registry.npm.taobao.org
```

<!-- endtab -->

{% endtabs %}

通过以下命令查看是否修改成功：

```bash
npm config get registry
```