---
title: 在Ubuntu桌面系统用原生微信的方法
id: 7871
date: 2022-05-31 13:00:57
categories: [瞎捣鼓经历]
tags: ['Linux', 'Ubuntu']
cover:
disableNunjucks: true
---

优麒麟系统（Ukylin）推出了原生的微信，于是我们把优麒麟软件源里的微信拿过来用即可。（补：都用Linux系统了还是别用微信了罢）

首先我们建立一个新的sourse.list文件，用于放置Ukylin的软件源：

```bash
sudo vi /etc/apt/sources.list.d/ukapps.list
```

在打开后的文件中添加以下内容：

```plaintext
deb http://archive.ubuntukylin.com/ubuntukylin focal-partner main
```

然后导入软件源的密钥：

```bash
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 56583E647FFA7DE7
```

接下来，执行：

```bash
sudo apt update
sudo apt install weixin
```

即可安装微信！体验上佳，只是没表情包、朋友圈，如下：

![f287cf086cb37f26fe6ea8145fee0202](https://blogfiles.oss.fyz666.xyz/png/2a57cd83-0480-4e6c-882a-7148a6c974ad.png)
