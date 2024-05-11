---
title: 使用Let's Encrypt生成通配符证书
id: 7669
date: 2022-05-09 19:52:31
categories: [瞎捣鼓经历]
tags: ['SSL']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/3fb1eb34adb46c81cef7bcc16678f6d0.png
disableNunjucks: true
---

本站长期以来维护着多个Web服务，除了此博客外，还有一个部署在80端口的ShareLaTeX以及其他杂七杂八的网站，这些站点没有https，每次访问时还得手动输入`http://`以及端口号，感觉既不安全也不优雅。因此最近我想用反代优化一下服务器站点的URL分配。

我所期望的结果是：


- 将所有网站服务均反代到443端口。
- 通过域名对服务进行区分。
- 所有服务都开启SSL。

那么不可避免地，我需要申请一张多域名的SSL证书（不然得各自申请证书，维护起来过于麻烦）。基于一劳永逸的考虑，这里我决定直接为通配符域名`*.fyz666.xyz`申请证书。


各大平台出售的通配符证书都贼贵，但这种东西明明是可以免费的，何必花这个冤枉钱。Let's Encrypt早已支持通配符SSL证书的签发，而且十分方便。


我的环境如下：


阿里云的Ubuntu 18.04镜像服务器，运行了多个Web服务，每个Web服务都独立运行在一个docker容器中。


接下来，我们安装Certbot：

```bash
sudo apt install certbot
```

安装完成后，准备用该程序来签发证书。运行certbot：

```bash
sudo certbot certonly --manual -d *.fyz666.xyz --preferred-challenges dns-01 --server https://acme-v02.api.letsencrypt.org/directory
```

在命令运行过程中会有一些交互，中途需要做一条txt解析以进行域名所有权的验证，签发下的证书会位于`/etc/letsencrypt/live`路径下。


通配符域名证书的续签过程与申请一样，只能通过dns-01的方式进行，因此自动化续签通配符证书，主要就是实现自动化DNS解析，这一步我们只要拿到域名所在的DNS服务商提供的Access Key与Access Token即可。这里有位大佬已经写好了[脚本](https://github.com/ywdblog/certbot-letencrypt-wildcardcertificates-alydns-au)与配置方法，直接拿来用就行！


拿到证书，接下来只要做反向代理就好了！反向代理的部署及踩坑过程会记录在后面的文章中。
