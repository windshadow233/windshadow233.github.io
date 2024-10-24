---
title: 'Ubuntu Server开机失败: "Fail to start nvidia-powerd service" 解决方法'
disableNunjucks: false
mathjax: false
id: 12074
date: 2024-10-24 18:43:15
categories: Debug
tags: Linux
cover:
---

今天远程连实验室服务器没成功连上，跑到实验室一看发现死机了，重启也启动不起来，进入了左上角光标不闪烁的画面。而之前我已解决过类似的情况：[Ubuntu 开机黑屏左上角光标不闪烁的解决办法](/blog/6585/)，于是熟练地打开grub，切到另一个内核，重启。然而还是失败了。在一闪而过的终端输出内容中，我定位到一条可能有用的信息：

```raw
[FAILED] Fail to start nvidia-powerd service.
```

果然还是显卡驱动出问题了。找到一条Nvidia forums上的解决方案：

{% link 解决方案,Nvidia forums,https://forums.developer.nvidia.com/t/ubuntu-does-not-booting-failed-to-start-nvidia-powerd-service/258557%}

根据帖子里的内容，进入Recovery mode后，用root登录终端，然后执行下面的命令即可：

```bash
apt-get remove --purge '^nvidia-.*'
apt-get install ubuntu-desktop
rm /etc/X11/xorg.conf
echo 'nouveau' | sudo tee -a /etc/modules
reboot
```

不过我并不想装`ubuntu-desktop`，于是把第二条命令删了。
