---
title: 如何为WSL虚拟磁盘瘦身
id: 5309
date: 2021-04-04 18:05:34
categories: 
  - 瞎捣鼓经历
tags: 
  - WSL
cover: 
disableNunjucks: true
---

我们知道虚拟磁盘占用的硬盘空间一般是只增不减的，在长期使用WSL后，虚拟磁盘会变得比较大，而其文件占用其实可能并没有那么多，这个时候可以使用diskpart工具进行压缩。


先关闭wsl：

```powershell
wsl --shutdown
```

在经历了一些麻烦之后，我现在对不太了解的操作比较小心谨慎，因此在后面的操作之前为磁盘留了备份：

```powershell
wsl --export name target_file
```

命令中的`name`可以通过`wsl -l` 命令进行查看。


然后运行diskpart命令，进入一个新的窗口，在窗口中运行：

```powershell
select vdisk file="vhdx文件名"
compact vdisk
```

稍作等待，即可完成压缩。
