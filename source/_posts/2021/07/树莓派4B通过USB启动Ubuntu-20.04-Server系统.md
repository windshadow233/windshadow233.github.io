---
title: 树莓派4B通过USB启动Ubuntu 20.04 Server系统
id: 5510
date: 2021-07-07 14:08:29
categories: [瞎捣鼓经历]
tags: ['Linux', '树莓派']
cover: https://blogfiles.oss.fyz666.xyz/png/3ae86098-858a-4244-9214-71553895359b.png
disableNunjucks: true
---

入手树莓派后，一直以来是用TF卡（micro SD卡）作为存储卡，我购买的TF卡只有32G，TF卡读写速度慢，且容易损坏。

因此我又购入了一块128G，提供USB接口的SSD硬盘，写入了Ubuntu 20.04 Server系统，试图从硬盘把树莓派启动起来。过程中遇坑无数，历经数十次失败后终于成功了，在此总结一下过程。

![](https://blogfiles.oss.fyz666.xyz/png/3ae86098-858a-4244-9214-71553895359b.png)

本文参考自[此文章](https://jamesachambers.com/raspberry-pi-4-ubuntu-20-04-usb-mass-storage-boot-guide/)


## 硬件


- 树莓派4B（4G内存）
- TF卡（SanDisk，32G）
- SSD硬盘（STmagic，USB接口，128G）
- 网线一根（为了通过SSH登录树莓派）
- HDMI显示屏（可选，便于实时观察启动过程，查看出现的问题，不过没有也无所谓）

## 软件


- Ubuntu 20.04.2 Server [点此下载](https://ubuntu.com/download/raspberry-pi/thank-you?version=20.04.2&architecture=server-arm64+raspi)
- Raspberry Pi OS（官方树莓派系统，也称为Raspbian）[点此下载](https://downloads.raspberrypi.org/raspios_lite_armhf/images/raspios_lite_armhf-2021-05-28/2021-05-07-raspios-buster-armhf-lite.zip)

## 进入正题


### 修改树莓派的启动配置


树莓派默认状态是TF卡启动，需要进行修改，修改需要用到官方树莓派系统，启动流程如下：


1. 将Raspberry Pi OS的img文件烧入TF卡，在boot目录下创建空的ssh文件以在开机后自动开启ssh服务。
2. 将TF卡插入树莓派，连接网线到路由器LAN口，打开电源启动系统。
3. 稍等片刻，用局域网扫描工具（如nmap）得到树莓派的IP地址，进而通过SSH登录，默认用户名和密码分别是pi、raspberry

登录到树莓派系统后，首先要进行系统的更新，执行以下命令：

```bash
sudo apt update
sudo apt full-upgrade
```

然后更新BootLoader，执行命令

```bash
vcgencmd bootloader_version
```

查看BootLoader版本，若日期早于2020.9.3，则其无法支持USB启动，需要进行更新。更新方法如下：


首先修改文件`/etc/default/rpi-eeprom-update`

```bash
sudo nano /etc/default/rpi-eeprom-update
```

将其修改为：

```raw
FIRMWARE_RELEASE_STATUS="stable"
```

即稳定版本，然后执行以下命令更新版本：

```bash
sudo rpi-eeprom-update -d -f /lib/firmware/raspberrypi/bootloader/stable/pieeprom-2021-04-29.bin
```

这里我用的是日期为2021-04-29的最新版本，请根据自己的文件对命令进行更改。


更新完以后需要reboot。


重启以后，执行命令

```bash
vcgencmd bootloader_version
```

检查版本日期是否为2021-04-29（或者你自己前面选择的版本日期），若无误，则执行命令

```bash
sudo raspi-config
```

以配置USB启动，在可视化界面中选择Advanced Options > BOOT ORDER，修改为USB启动，对应的配置为0x41（即首先检查TF卡，若检查不到或TF卡内没有安装系统，则使用USB启动）。


设置完成后需要reboot。


重启后，执行命令

```bash
vcgencmd bootloader_config
```

检查BOOT_ORDER项，若一切正常，该项的值应为0x41。


做了以上的操作之后，接下来对SSD内的Ubuntu系统进行一些修改，以支持USB启动。


### 修改Ubuntu系统


Ubuntu 20.04 Server镜像无法直接通过USB启动树莓派，需要做一些修改。将该镜像写入SSD设备，SSD连接到树莓派的USB接口，我购买的SSD的接口是USB3.0，因此接到蓝色的USB3.0接口上。


执行命令`sudo fdisk -l`可以查看到所有设备，很容易识别出自己的SSD设备，比如我的是`/dev/sda`。


在/mnt目录下创建boot目录和writable目录，分别把SSD的两个挂载点挂载到boot和writable目录：

```bash
sudo mkdir /mnt/boot
sudo mkdir /mnt/writable
sudo mount /dev/sda1 /mnt/boot
sudo mount /dev/sda2 /mnt/writable
```

需要根据自己设备的情况修改命令里的/dev/sda1和/dev/sda2。


然后运行一个脚本，以对系统进行修改：

```bash
sudo curl https://raw.githubusercontent.com/TheRemote/Ubuntu-Server-raspi4-unofficial/master/BootFix.sh | sudo bash
```

如果访问困难，可以先开梯子下载下来，再运行。


接下来，是我之前失败的数十次尝试中未曾操作的步骤，在操作了这个步骤后，USB启动再没有遇到任何其他问题，而且开机速度飞快。


### 使用Quirks修复USB适配器的问题


在我通过USB启动树莓派失败的时候，大多是进入了emergency mode，无法正常开机，可能是因为我的USB存储适配器不能很好地与 Raspberry Pi 4 配合使用。如果你已经可以正常通过USB启动，则可以直接省略下面的步骤。


执行命令：

```bash
lsusb
```

查看本机检测到的USB适配器，很容易可以找到自己的USB适配器的ID，比如我的是：`152d:0578`


![](https://blogfiles.oss.fyz666.xyz/jpg/4fab1261-f1a6-462c-b831-0b2cf2a12d8d.jpg)将此ID记录下来。


修改文件`/mnt/boot/cmdline.txt`，在最前面加上以下内容（结尾有个空格与原来的内容分隔开）：

```raw
usb-storage.quirks=152d:0578:u 
```

注意将ID部分修改为自己的USB适配器ID，经过如此修改后，可以将`/mnt/boot`和`/mnt/writable`两个挂载点取消挂载，随后用`sudo shutdown now`命令关闭树莓派，关闭电源，将TF卡移除后，重新开启电源，如一切顺利，树莓派就可以通过USB启动了！
