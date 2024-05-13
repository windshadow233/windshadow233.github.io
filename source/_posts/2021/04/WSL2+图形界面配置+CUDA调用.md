---
title: WSL2+图形界面配置+CUDA调用
id: 5313
date: 2021-04-05 18:13:08
categories: [瞎捣鼓经历]
tags: ['Linux', 'Ubuntu', 'WSL']
cover: https://blogfiles.oss.fyz666.xyz/png/0ceb85a8-1af1-4212-b9dc-f396fb626df8.png
disableNunjucks: true
---

由于种种原因，我需要一台能调用NVIDIA CUDA的Linux系统机，众所周知，大部分虚拟机由于使用的是虚拟显卡，是没办法调用CUDA的。

然而我既不想装双系统，也不想在白嫖别人的服务器上瞎折腾，一筹莫展之时，偶然了解到Windows 10预览版本为其内置的Linux子系统WSL2增加了CUDA支持，二话不说直接安排一波。


## 更新Windows系统


首先，需要将Win 10升级到预览版本，打开设置界面选择“更新与安全”，拖至底部可见选项“Windows预览体验计划”，在其中使用自己的Microsoft账户进行申请即可，然后将渠道设置为Dev，该渠道能获取到latest更新版本。


稍等片刻，进入Windows更新，若一切正常应该会在这里收到提醒更新的信息，在我操作时的最新版本号为“21343.1000”，然后则需要耐心等待系统更新完全。


## 安装WSL2的Ubuntu 18.04 LTS


安装WSL2的操作[官方文档](https://docs.microsoft.com/zh-cn/windows/wsl/install-win10)写的比较详细。（其实文档里的操作我都没什么印象，好像很早以前用docker for desktop的时候就已经通过某种其他途径装好了WSL2）


然后去Windows应用商店搜索Ubuntu，在弹出的几个选项中选择Ubuntu 18.04 LTS，这里尽量不要选新的20.04版本，反正我试了下发现图形界面跑不起来，而18.04版本没有任何问题。


## 安装显卡驱动


在WSL2中调用GPU，不需要在虚拟机里面安装显卡驱动，而是在Windows中安装对应的驱动，NVIDIA已推出适用于WSL的CUDA驱动：[入口](https://developer.nvidia.com/cuda/wsl/download)，这里需要根据显卡的型号来进行选择。


下载完驱动文件以后，运行之，进行一套菜鸟式安装即可，我没有遇到任何问题。


### WSL2中安装CUDA Toolkit


进入刚刚前面创建的Ubuntu18.04，执行下面的命令：

```bash
sudo apt-key adv --fetch-keys http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64/7fa2af80.pub
sudo sh -c 'echo "deb http://developer.download.nvidia.com/compute/cuda/repos/ubuntu1804/x86_64 /" > /etc/apt/sources.list.d/cuda.list'
sudo apt-get update
sudo apt-get install -y cuda-toolkit-11-0
```

如果遇到类似于“E: Unable to fetch some archives...”这样的错误，考虑换源。


### 检查虚拟机是否支持CUDA


简单粗暴，直接安装pytorch，并在console中运行`torch.cuda.is_available()`，如果输出True则可调用CUDA。


## 安装图形界面GNOME


Windows端采用VcXsrv软件，[下载链接](https://sourceforge.net/projects/vcxsrv/)


下载完成后，双击文件夹下的xlaunch.exe文件进入配置界面。


第一个界面中只要勾选的不是Multiple windows选项即可：


![](https://blogfiles.oss.fyz666.xyz/png/5613758a-cb15-4b99-b6b7-106ed4e0b68e.png)第二个界面直接下一页，第三个界面中，必须勾选Disable access control：


![](https://blogfiles.oss.fyz666.xyz/png/1f253a94-594a-4fe4-a515-63a617ed24d8.png)然后依次下一页、完成，屏幕上将会出现一个黑框界面，目前还啥都没有。


进入Ubuntu系统，运行命令：

```bash
sudo apt install ubuntu-desktop
```

将安装Ubuntu的默认桌面，即非常赏心悦目的GNOME桌面（不得不说，虽然Ubuntu的软件生态不如Windows，图形界面的功能也没也Windows完善，但在美感上，Windows还是要学习一个，不过话说回来，Win 10预览版的图标风格好像在逐渐Mac化了...）


安装完成后，运行：

```bash
sudo service dbus restart
```

修改/root/.bashrc文件，添加下面两行：

```bash
export DISPLAY=$(grep -m 1 nameserver /etc/resolv.conf | awk '{print $2}'):0.0
export XDG_SESSION_TYPE=x11
```

运行`source /root/.bashrc`使得修改生效，不出意外的话，在刚刚的黑屏幕中已经可以看到图形界面了，在经过美化以后还是相当舒适的，下面贴一下我的桌面：


![](https://blogfiles.oss.fyz666.xyz/webp/768836b8-77af-4822-a3ee-57e969d12ca5.webp)至此，Ubuntu的图形界面已经安排上了，但国内的软件生态好像不太好，居然连WeChat等常用的即时通讯软件都没有。
