---
title: 使用密钥登录SSH
id: 4227
date: 2020-08-20 06:25:24
categories: [瞎捣鼓经历]
tags: ['Linux', 'SSH']
cover: 
disableNunjucks: true
---

由于使用密码登录ssh相对而言安全性差一点（而且每次都输密码太麻烦了），我们可以使用密钥进行ssh连接。

先在本地生成一对rsa密钥：

```bash
ssh-keygen -t rsa -m PEM -b 3072
```

随后一路回车即可。


接下来进入用户目录`C://Users/用户名/`，可以发现已经生成了一个`.ssh`文件夹。里面包含`id_rsa`和`id_rsa.pub`两个文件，其中后者是公钥文件。将公钥文件`id_rsa.pub`上传到服务器需要密钥登录的用户名文件夹的`.ssh`目录下（如果没有`.ssh`目录就自己创建一个），并将公钥文件重命名为`authorized_keys`，例如`/home/user1/.ssh/authorized_keys`。


现在在本地进行ssh连接：`ssh user1@ip` 已经默认使用密钥了。


接下来需要禁止该用户使用密码登录：


登录服务器修改`/etc/ssh/sshd_config`文件：

```bash
sudo vi /etc/ssh/sshd_config
```

添加下面内容（user1是禁用密码登录的用户名）：

```raw
Match user user1
        PasswordAuthentication no
```


```bash
# 重启sshd服务
sudo systemctl restart sshd.service
```