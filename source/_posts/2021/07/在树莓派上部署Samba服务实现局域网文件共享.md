---
title: 在树莓派上部署Samba服务实现局域网文件共享
id: 5547
date: 2021-07-14 12:30:27
categories: [瞎捣鼓经历]
tags: ['Linux', 'Samba', '树莓派']
cover: 
disableNunjucks: true
---

很早以前买了一块1T的SSD移动硬盘，但找不到啥用处，一直放在家里吃灰，这几天突发奇想，打算把移动硬盘挂载到树莓派上，搞一个局域网文件共享系统，后期可以配合其他设备来实现各种功能。



通过简单的搜索，我了解到一种通信协议称为SMB（Server Message Block），通过一款叫Samba的软件应用到Linux系统上，实现了Linux与Windows文件共享。而且该服务的配置也通俗易懂容易入门，因此我决定在树莓派上整一个。


## 硬件配置


主要是树莓派4B（4G内存很够用），另外当然是一块用于存放文件的存储设备（正常人应该不会想用树莓派系统盘作为存储设备吧）


## 软件配置


树莓派使用了64位Ubuntu 20.04 Server作为运行系统。


## 处理存储设备


这里我先把SSD格式化了一下，目标格式选择了适应性更广的exFAT，其适合用来存储大容量文件，还可以在Mac和Windows等主流操作系统上通用。


将SSD接到树莓派的USB接口上，正常情况下，树莓派可以识别到该SSD的信息。执行以下命令查看SSD的设备名：



```bash
sudo fdisk -l
```

然后将其挂载到一个用于共享文件的目录（我选择的路径是/mnt/shared），指定uid和gid分别为nobody、nogroup，表示公共文件区域，并设置权限为777，为了让exFAT格式的硬盘挂载地更顺利，可以提前安装两个工具包：



```bash
sudo apt install exfat-fuse exfat-utils
```

然后再挂载：



```bash
sudo mkdir /mnt/shared
sudo mount /dev/sda1 -t exfat /mnt/shared -o iocharset=utf8,uid=nobody,gid=nogroup,umask=0000
```

不出意外的话，硬盘可以挂载到/mnt/shared目录，切换到该目录下，并创建两个文件夹，分别用于存放公共文件与私有文件：



```bash
cd /mnt/shared
sudo mkdir public
sudo mkdir private
```

在后面的操作中将实现public目录下的文件公开到局域网下所有用户，private目录下的文件需要通过认证才可访问。


## 安装Samba


执行命令：



```bash
sudo apt install samba samba-common
```

即可安装该服务。


### 全局配置


正常情况下，其配置文件应该位于/etc/samba目录下，先对其进行简单的修改：



```bash
sudo vi /etc/samba/smb.conf
```

在前面的`[global]`下增加两行：



```ini
[global]
   ...
   security = user
   passdb backend = tdbsam
```

然后重启服务：



```bash
sudo /etc/init.d/smbd restart
```

接下来，为Samba服务添加一个用户，该用户需要是Linux系统中存在的用户，例如我的树莓派系统下有个用户叫ubuntu，故可通过以下命令将其添加进去



```bash
sudo smbpasswd -a ubuntu
```

设置好密码，即可添加成功。


### 配置共享文件


依然修改/etc/samba/smb.conf：



```bash
sudo vi /etc/samba/smb.conf
```

在文件的末尾添加以下内容：



```ini
[public]
   comment = Public Files
   path = /mnt/shared/public
   read only = no
   public = yes
   browseable = yes
   writable = yes
   available = yes

[private]
   comment = Private Files
   path = /mnt/shared/private
   read only = no
   public = no
   browseable = yes
   writable = yes
   available = yes
   valid users = ubuntu
```

这些配置信息通俗易懂，大概意思是设置了两个访问路径，分别为public与private，对应到本地刚刚创建的/mnt/shared/public和/mnt/shared/private目录，然后对两个访问路径的权限进行了基本的配置，private目录只有ubuntu用户才能访问。详细的配置参数信息建议阅读官方文档！最后再重启服务，服务即配置成功！真的是非常之ez！



```bash
sudo /etc/init.d/smbd restart
```

## 开机自启脚本


由于我的存储设备是额外挂上去的，保不准哪天我忘记挂硬盘，导致Samba服务出现一些潜在的问题，基于此，我把服务的开机启动取消了，同时在rc.local中写了一段脚本来控制服务的启动。


先取消服务的开机自启



```bash
sudo systemctl disable smbd
```

在/etc/rc.local中增加以下脚本：



```bash
extra_disk=`fdisk -l | grep 'Microsoft basic data' | awk '{print $1}'`
if [ -n "$extra_disk" ];
then
	mount $extra_disk /mnt/shared -o iocharset=utf8,uid=nobody,gid=nogroup,umask=0000
	systemctl start smbd
fi
```

其中'Microsoft basic data'是我SSD上的识别信息，如果识别到该字符串，则意味着硬盘已经接上树莓派了，从而执行if语句内的挂载硬盘命令和服务启动命令。（bash的语法真是反人类。。。）


另外，还有一种开机挂载硬盘的方法，是通过/etc/fstab文件，在该文件中加上下面一行内容：



```bash
UUID=7B4D-E1F4  /mnt/shared     auto defaults,nofail,x-systemd.device-timeout=1,noatime,umask=0000,nonempty,iocharset=utf8       0       0
```

其中UUID是硬盘设备的UUID，可通过blkid命令获取。


如此一来，Samba服务已经配置成功了，不过具体如何在其他设备上访问，这个涉及到设备的操作系统对Samba服务的支持方式，可[查看此文](https://blog.fyz666.xyz/blog/5556/)！


不过，树莓派的USB电流大小似乎不太够支持1T的移动硬盘，可以考虑外部供电。
