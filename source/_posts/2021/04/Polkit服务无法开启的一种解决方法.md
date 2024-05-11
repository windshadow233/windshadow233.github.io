---
title: Polkit服务无法开启的一种解决方法
id: 5356
date: 2021-04-15 15:37:58
categories: [Debug]
tags: ['Linux']
cover:
disableNunjucks: true
---

今天在CentOS服务器上想使用docker时，发现运行不起来，仔细一看报错内容，大概说是让我检查一下polkit.service有没有正常运作，因此使用命令`systemctl status polkit`进行查看，发现


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/jpg/1f17afd91b0a70ae5a9cb7a13fc79b4d.jpg)
好像确实没有运行起来...，直接运行`systemctl start polkit`妄图开启服务，果不其然失败了。然后我试了好多种方法，也重装了两次polkit，均失败。


了解到Polkit是Linux系统中的一个身份认证管理工具，它无法正常工作便会导致一些服务无法启动。经过一番搜索，最后的解决方法如下：


修改/etc/selinux/config文件，将SELINUX的值改为disabled，然后运行命令`setenforce 0`使修改生效。这之后就可以正常运行polkit和docker服务了。
