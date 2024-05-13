---
title: Ubuntu开机黑屏左上角光标不闪烁的解决办法
id: 6585
date: 2021-10-15 17:55:47
categories: [Debug]
tags: ['Linux']
cover:
disableNunjucks: true
---

不小心装错了显卡驱动，导致Ubuntu系统开机黑屏。这种情况很有可能是装驱动的时候生成了新的系统内核，然后GRUB默认用新内核启动，而新内核有问题导致的。

遇到这种情况时，可以重启，进入GRUB界面时，选择Advanced options for Ubuntu，如果显示内容和下图类似，那么可以通过删除错误内核的方式，解决此问题。


![](https://blogfiles.oss.fyz666.xyz/jpg/d3cbedb7-619d-4a63-bf17-16242e3edafe.jpg)
图片中显示有两个Linux内核，前面的5.4.0-87是默认内核，但无法正常启动，因此该内核是有问题的，我们可以选择第三个5.4.0-86，应该可以正常启动起来。


在正常启动后，使用命令删除一些相关的包，然后删掉/boot路径下与5.4.0-87内核相关的所有内容，最后更新一下GRUB即可，命令如下：

```bash
sudo apt remove *5.4.0-87
sudo update-grub
```

再次重启，发现已经可以正常启动了！
