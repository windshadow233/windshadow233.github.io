---
title: 服务器SSH配置出错导致无法连接问题的解决
id: 4520
date: 2020-08-23 16:39:31
categories: [Debug]
tags: ['Linux', 'SSH']
cover: 
disableNunjucks: true
---

有时候在操作服务器的过程中，一不小心（或有意）动了SSH的配置文件，导致其崩溃，关闭连接后无法再一次连接。就这个问题，本文从我个人的经验来写一些解决方法。

1. 傻瓜式方法，一般提供服务器的厂商都会提供一键重装系统的功能，如果没什么重要数据，重装系统可以解决100%的问题。
2. 如果有备份，也可以直接恢复备份。
3. 提供服务器的厂商一般会提供紧急救援连接，比如阿里云，我们可以通过救援连接登录服务器，然后修改配置文件，若不会修改配置文件或是因为其他配置问题导致的崩溃，直接重装SSH也是可以的，以下是操作过程：


```bash
sudo apt-get remove openssh-server  openssh-client --purge -y
sudo apt-get autoremove
sudo apt-get autoclean
sudo apt-get install openssh-server openssh-client
```

安装完成以后，简单修改一下配置文件：

```bash
sudo vi /etc/ssh/sshd_config
```

添加root密码登录的配置：

```raw
PermitRootLogin yes
PasswordAuthentication yes
```

保存退出，然后重启服务：

```bash
sudo systemctl restart sshd.service
```

问题解决！
