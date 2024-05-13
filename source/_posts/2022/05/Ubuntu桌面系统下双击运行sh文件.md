---
title: Ubuntu桌面系统下双击运行sh文件
id: 7767
date: 2022-05-15 09:10:09
categories: [瞎捣鼓经历]
tags: ['Linux', 'Ubuntu']
cover:
disableNunjucks: true
---

在桌面系统的Ubuntu下，我们运行sh文件通常仍需要打开终端，然后敲一条命令才能运行，非常麻烦，很自然的想法就是是否可以像windows一样通过双击的方式，来运行一个sh文件。

早一些版本的Ubuntu系统似乎是可以直接在文件系统里进行设置的，而我用的版本并没有该功能的直接设置界面（反正我没找到），因此需要安装一个软件：

```bash
sudo apt install dconf-editor
```

然后运行：

```bash
dconf-editor
```

依次选中以下选项：

![](https://blogfiles.oss.fyz666.xyz/png/abf7ebb2-4b7f-4bc1-9200-27da169e0174.png)
然后可以在Custom value中将'display'替换为'ask'。


最后，右键sh文件选中Properties，在Permissions栏下勾选Allow executing file as program。如此，在双击sh文件的时候，便会对你进行询问：

![image-7](https://blogfiles.oss.fyz666.xyz/png/4d3c32e5-41c0-46e3-b813-25ec05b2357e.png)
