---
title: 如何在一些常用设备（操作系统）上访问局域网内的Samba服务
id: 5556
date: 2021-07-19 07:37:06
categories: [瞎捣鼓经历]
tags: ['Samba']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/e540de06f14845c637edea215eb1e5cc.png
disableNunjucks: true
---

[前面文章](/blog/5547/)中写到了Samba服务的部署过程，但未提到如何在局域网的其他设备上访问该服务以获取共享的文件，虽然这些东西谷歌一查就有，但我还是想水个文章，对常用操作系统上访问该服务的方法做一个总结。

## Windows 10/11


在Windows 10/11系统上，不需要装任何其他软件，便可访问局域网的Samba服务。以下以Samba服务器的局域网IP地址为192.168.42.2为例。


临时访问服务，只需打开文件资源管理器，在地址栏中输入`\\192.168.42.2`，敲个回车，即可看到所有共享的目录，若某些共享目录需要身份认证，则双击进入时会要求账号密码。


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/05cbc267343d1ce9f9a6d612d780a049.png)
![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/e540de06f14845c637edea215eb1e5cc.png)
若要长期挂载使用，可直接右击“此电脑”，选择“映射网络驱动器”，在界面中输入想要挂载的路径，例如`\\192.168.42.2\public`


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/4ff7c8cac0a1c19d471e963f47adfac6.png)
不过此方法需要提前知道共享目录的名称。挂载成功后，可以在文件资源管理器的“网络位置”栏看到挂载的目录：


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/db23b5c8b9baf835b71b1c1118334d9b.png)
## Linux


Linux系统下同样有很多方法，这里举两个比较简单的方法，其一是直接通过mount命令挂载。


首先在本地创建几个用于挂载的文件夹：

```bash
sudo mkdir /mnt/public
sudo mkdir /mnt/private
```

然后执行命令：

```bash
sudo mount -t cifs //192.168.42.2/public /mnt/public/
```

挂载向guest开放的public目录。


执行命令：

```bash
sudo mount -t cifs -o user=user1,password=123456 //192.168.42.2/private /mnt/private/
```

挂载仅向用户user1（密码为123456）开放的private目录。


如果上面的挂载无法正常进行，提示缺一个包，则执行以下命令进行安装：

```bash
sudo apt install cifs-utils
```

若提示`mount error(2): No such file or directory`，在确保路径没打错的情况下，可检查一下samba的版本，若为2.0版，则在命令里加上：

```bash
sudo mount -t cifs -o vers=2.0 //192.168.42.2/public /mnt/public/
```

其二，如果系统带有桌面，很多桌面的文件资源管理器都会带有连接samba、ftp等服务的功能，例如我用的Gnome桌面：


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/6a1edeb8535e895b6b805ef4cd1c0a3b.png)
如此即可轻松访问到samba服务。


## iOS


iOS系统自带一个“文件”应用，打开该应用，点击右上角的三个点，选择“连接服务器”，在服务器栏添加Samba服务的IP地址（例如192.168.42.2），接下来选择身份为客人或注册用户，即可以guest身份或注册用户的身份访问共享目录。同样非常简单，这里不再贴图。


其他的系统目前还没有用到，以后用上了再更新此文。
