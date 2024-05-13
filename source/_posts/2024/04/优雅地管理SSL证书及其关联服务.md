---
title: 优雅地管理SSL证书及其关联服务
id: 10068
date: 2024-04-02 15:09:38
categories: [瞎捣鼓经历]
tags: ['Linux', 'SSL']
cover: 
disableNunjucks: false
---

我的服务器上开着一堆服务，其中有一些需要用到SSL证书，例如Nginx及前面刚刚部署的邮件服务。我的SSL证书是通过certbot向Let's Encrypt申请的，证书有效期为90天，也就是说每隔80多天就得更新一下证书。

## 动机

在证书更新后，自然需要将所有用到证书的服务reload一下，以加载新的证书，通常我会写一条crontab作业来干这件事。之前我只有一台服务器A跑Nginx服务的时候，这样感觉还比较舒服，而现在情况变得更加复杂了：

这两年我都在维护我们实验室主办的学术会议的官网（规模不大，因此把官网部署在我的服务器上完全没问题），所以需要同时维护两个域名的证书。另外，我现在还同时维护着另一台B服务器——两台服务器上的服务共享着同一个域名证书，所以需要在A服务器上的证书更新时同步到B服务器上，并在B服务器上reload所有用到证书的服务。

于是原先的方法感觉就不太优雅了。正巧这两天iBug大佬发布了一篇文章，介绍了一种通过systemd来reload一些服务的方法：

{% link Reload SSL certificates with systemd,iBug,https://ibug.io/blog/2024/03/reload-ssl-cert-with-systemd/ %}

看上去非常优雅，于是我学习了一下，也给整了起来。

## 服务器A上的操作


首先我将申请证书的脚本从certbot换成了更轻量的[acme.sh](https://github.com/acmesh-official/acme.sh)，安装完成后直接支持通过接入cloudflare以及godaddy的dns api来更新泛域名证书（而certbot则需要分别安装两者的插件，感觉稍显笨重）


我将A服务器作为更新证书的机器，更新证书后自动同步给B，在A服务器上只有Nginx服务需要reload，因此先创建`/etc/systemd/system/ssl-certificate.target`：

```bash
# /etc/systemd/system/ssl-certificate.target
[Unit]
Description=SSL certificates reload helper
PropagatesReloadTo=nginx.service
```

然后创建一个path文件`/etc/systemd/system/ssl-certificate.path`来监听证书文件的变更事件：

```bash
# /etc/systemd/system/ssl-certificate.path
[Unit]
Description=SSL certificate reload helper
Wants=%N.target

[Path]
PathChanged=/path/to/cert1/fullchain.cer
PathChanged=/path/to/cert2/fullchain.cer

[Install]
WantedBy=multi-user.target
```

我有两个证书，所以这里加了两条`PathChanged`字段分别监听证书1和证书2的变更事件。


最后由于path单元只能激活服务而没办法重载服务，所以需要创建一个“一次性”的（oneshot）service，每次激活时来reload服务：

`/etc/systemd/system/ssl-certificate.service`

```bash
# /etc/systemd/system/ssl-certificate.service
[Unit]
Description=SSL certificate reload helper
StartLimitIntervalSec=5s
StartLimitBurst=2

[Service]
Type=oneshot
ExecStart=/bin/sh -c '/bin/systemctl reload %N.target; /usr/local/bin/rsync_cert.sh'
```

这里我需要额外执行的工作还有向B服务器同步证书1，因此采用了将两条命令写在一起的方式。同步证书则使用了`rsync`命令。

`/usr/local/bin/rsync_cert.sh`

```bash
#!/bin/bash

rsync -avzL -e 'ssh -i /path/to/priv_key' /path/to/cert1/ user@serverB:/path/to/cert1/
```

需要先手动执行一下这个脚本将服务器B的公钥写入到`~/.ssh/known_hosts`，后面就能自动化了。


最后启动创建的path单元：

```bash
systemctl daemon-reload
systemctl enable --now ssl-certificate.path
```

## 服务器B上的操作


在服务器B上，同样可以创建与前面相似的`target`、`path`及`service`单元，这样当新的证书同步过去后，也会触发reload。


由于我的mailserver是部署在docker里的，好像不太好通过systemd来维护，因此同样采用了这种更愚蠢的办法，只是因为命令比较多，就干脆专门写了一个文件：

`/etc/systemd/system/ssl-certificate.service`

```bash
# /etc/systemd/system/ssl-certificate.service
[Unit]
Description=SSL certificate reload helper
StartLimitIntervalSec=5s
StartLimitBurst=2

[Service]
Type=oneshot
ExecStart=/usr/local/bin/reload-services.sh
```

`/usr/local/bin/reload-services.sh`

```bash
#!/bin/bash

set +e

/bin/systemctl reload ssl-certificate.target

/bin/docker exec mailserver postfix reload
/bin/docker exec mailserver dovecot reload
```

如此配置，当SSL证书更新时，两台服务器上的所有相关服务都可以顺利自动重新加载证书了！
