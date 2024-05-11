---
title: Docker for Windows磁盘映像文件迁移
id: 3924
date: 2020-08-12 12:19:43
categories: [瞎捣鼓经历]
tags: ['Docker', 'WSL']
cover: 
disableNunjucks: true
---

最近在windows 10系统上安装了docker，随手pull了几个镜像后，发现C盘空间锐减（少了1-2个G），心想其默认镜像存储空间铁定在C盘了，故得想办法将其揪出来，并修改一下默认路径。

查了好多资料，基本都表示windows版的docker是基于hyper-v虚拟机运行的，需要去修改hyper-v虚拟机的一个虚拟磁盘路径，但我找了一下发现我甚至连hyper-v虚拟机都没有创建。。。那是怎么运行起来docker的呢？


后来了解到我的docker版本是2.3.0.4，这一版本已经不依赖于hyper-v了，而采用了WSL 2这种我没听说过的东西。


用TreeSizeFree软件扫描了一下C盘之后在AppData下面找到了一个很大的Docker文件夹，文件夹内部文件结构大概是：`Docker/wsl/data/ext4.vhdx`。


这个ext4.vhdx就是一个磁盘映像文件，非常大。下面是将其转移的操作步骤：


1. 停止docker
2. 关闭WSL：`wsl --shutdown`
3. 导出数据到随便哪个盘：`wsl --export docker-desktop-data F:\docker-desktop-data.tar`
4. 注销docker-desktop-data：`wsl --unregister docker-desktop-data`
5. 转移数据到你想要的位置：`wsl --import docker-desktop-data F:\docker\wsl\docker-desktop-data\ F:\docker-desktop-data.tar --version 2`
