---
title: 一次Emergency Mode修复
id: 7640
date: 2022-04-30 08:14:44
categories: [Debug]
tags: ['Linux', 'Ubuntu']
cover: 
disableNunjucks: true
---

今天重启了一下Ubuntu系统，再开机时进入了emergency mode。心态大崩。

又重启了一下，则进入了GRUB界面，怀疑有错误的内核，因此我选了一下Advanced options for Ubuntu，然而发现并没有多余的内核。启动后仍然是emergency mode。于是，执行命令：

```bash
journalctl -xb | grep failed
```

发现一条这样的错误：

```plaintext
Unit boot-efi.mount has failed.
```

显然是efi分区挂载失败了导致没法正常启动。手动挂载：

```bash
mount /boot/efi
```

报错（大概长下面这样）：

```plaintext
FAT-fs(nvme0n1p1): IO charset iso8859-1 not found.
```

然后上Stack Overflow一搜，就找到了解决方法，执行下面命令即可：

```bash
depmod
```

重启，问题解决！又可以愉快上网了！
