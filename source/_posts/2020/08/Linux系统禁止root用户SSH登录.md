---
title: Linux系统禁止root用户SSH登录
id: 4211
date: 2020-08-19 13:39:54
categories: [瞎捣鼓经历]
tags: ['Linux', 'SSH']
cover: 
disableNunjucks: false
---

Root用户在linux系统中拥有至高无上的权力与地位，可以做任何你想做的事，因此若一旦被不怀好意的人暴力破解root用户的密码，服务器就会陷入危险境地。

（我的服务器：这么看得起我？？？）咳咳，虽然我的服务器不值得被其他人暴破，但流程还是要走一下的。阿里云的Linux服务器自带了一个可以在控制台无密码登录的admin用户，因此只要禁止root登录SSH即可。而我不太喜欢阿里云的远程连接界面，故又创了一个新用户。


禁止root用户登录的操作：

```bash
# 打开以下文件
sudo vi /etc/ssh/sshd_config
```

{% tabs tab1 %}

<!-- tab 方法一 -->

```raw
# 翻到文件最下面将这一项修改为no
PermitRootLogin no
```


```bash
# 重启sshd
sudo systemctl restart sshd.service
```

但这种方法过于简单粗暴，也直接限制了root的sftp登录，如果想让root用户仍可以登录sftp，则可以使用方法二。

<!-- endtab -->

<!-- tab 方法二 -->

```raw
# 这一项不修改
PermitRootLogin yes
# 添加下面两行
Match user root
        ForceCommand internal-sftp
```


```bash
# 重启sshd
sudo systemctl restart sshd.service
```


以下操作用于新建用户：

```bash
# 新建一个用户（命名为user1）
sudo adduser user1
# 为其设置密码
sudo passwd user1
```

设置密码以后，便可以用该用户登录ssh，然后使用`sudo su`来切换root用户，唯一的缺点就是需要再输一遍密码，以下操作可以避免之：

```bash
# 使用visudo命令打开sudoers文件
sudo visudo /etc/sudoers
```


```raw
# 添加一行
user1    ALL=(ALL)  NOPASSWD:ALL
```

<!-- endtab -->

{%endtabs%}