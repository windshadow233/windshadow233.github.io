---
title: 重塑密码管理体系——Bitwarden服务端自部署
id: 9235
date: 2024-02-02 15:11:27
categories: [瞎捣鼓经历]
tags: ['Bitwarden', 'Docker']
cover: https://blogfiles.oss.fyz666.xyz/png/84f9ac75-6609-487a-9190-8b45a38064df.png
disableNunjucks: false
swiper_index: 1
description: 自部署一个密码管理平台
---

经常问我借账号的朋友都知道，我这个人记性不好，也因此，我所有平台的密码都长的大同小异（基本都是由同一个字符串通过变换字母大小写、截取子串，或者添加一两个特殊符号得来的）。

## 使用相似密码的坏处


像我这样在各平台用相似度极高的密码，虽然方便了记忆，但后果也很严重：[某些不负责任的平台<i class="iconfont icon-csdn"></i>](https://www.csdn.net/)会用明文存储用户密码，然后还tm[泄漏了](https://zh.wikipedia.org/wiki/2011%E5%B9%B4%E4%B8%AD%E5%9B%BD%E7%BD%91%E7%AB%99%E7%94%A8%E6%88%B7%E4%BF%A1%E6%81%AF%E6%B3%84%E9%9C%B2%E4%BA%8B%E4%BB%B6)。。。这就造成了我们的常用密码被添加到了字典里，黑客便可通过这些字典来轻松破解我们其他平台的密码<s>（虽然并没有什么值得被黑客盯上的东西）</s>。


因此，将各种平台的密码设成互相毫无关联的随机字符串才是妥当的方案，这种安全的密码设置画风应该是下面这样的：


- QQ：Tx8RYq%\*fStp3r
- 微信：D6MuyvxS!6e$Zc
- Apple账号：&Nm4PvAdL\*cH#v
- 科大邮箱：vSP6nC$QZrh3z%
- ...

然而如果把各平台的密码都设成这种鸟样，安全性虽然能保证了，但毕竟我的脑子不是硬盘，肯定是记不住的，所以很自然地就需要一款能为我们管理各平台的密码的软件。~~拥有过目不忘能力的同学到了这就已经可以不用往下看了。~~


这种软件需要至少满足下面的条件：


- 安全可靠：能够为我生成强密码且有密码学安全的密码库加密算法
- 可移植性：支持各种操作系统、各种浏览器端都有集成插件
- 云端存储：支持多设备间同步密码库
- 使用便捷：支持用户名密码自动填充、支持生物识别功能（例如人脸、指纹等）
- 集成一些特殊功能：例如双因子验证（即所谓的2FA）

事实上这样的软件有非常之多，例如比较有名的1Password。我这里选择了一款名为Bitwarden的软件，原因是它免费、开源且可自部署<s>（还不是因为开不起1Password的会员）</s>，这篇文章就用来记录一下部署的过程。

![](https://blogfiles.oss.fyz666.xyz/png/84f9ac75-6609-487a-9190-8b45a38064df.png)

## 部署Bitwarden

项目的GitHub地址如下：

{%link vaultwarden,GitHub,https://github.com/dani-garcia/vaultwarden %}


为方便起见，使用docker进行部署。


docker-compose.yml：

```yaml
version: '3'

services:
  bitwarden:
    image: vaultwarden/server:latest
    container_name: vaultwarden
    restart: unless-stopped
    volumes:
      - ./bw-data:/data
    environment:
      - WEBSOCKET_ENABLED=true
      - SIGNUPS_ALLOWED=true
      - WEB_VAULT_ENABLED=true
      - ADMIN_TOKEN=xxxxxxxx
      - SHOW_PASSWORD_HINT=true
      - DOMAIN=yourdomain.tld
    ports:
      - "127.0.0.1:8889:80"
      - "127.0.0.1:8810:3012"
```

这里需要设置一个ADMIN_TOKEN作为管理员账号的密码，并且在DOMAIN字段填上完整的访问链接，在容器开启以后，可访问/admin进入管理界面。上面配置中，SIGNUPS_ALLOWED=true表示支持新用户注册，我们可以在注册完自己的账号后将该配置改为false并更新容器。


## 配置Nginx


另外，我们在容器外部用Nginx做一个反向代理，代理到443端口并提供TLS证书：

```nginx
upstream bitwarden-default { server 127.0.0.1:8889; }
upstream bitwarden-ws { server 127.0.0.1:8810; }

server {
    listen 80;
    listen 443 ssl http2;
    server_name yourdomain.tld;

    ssl_certificate /path/to/cert;
    ssl_certificate_key /path/to/key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;

    if ($scheme = http){
      return 301 https://$host$request_uri;
    }

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy upgrade-insecure-requests;
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "no-referrer-when-downgrade";

    client_max_body_size 128M;
    # reverse proxy
    location / {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://bitwarden-default;
    }

    location /notifications/hub/negotiate {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://bitwarden-default;
    }

    location /notifications/hub {
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header X-Real-IP $remote_addr;
        proxy_pass http://bitwarden-ws;
    }
}
```

如此一来，bitwarden就配置好了。

(不过不知为啥notifications没配置成功，但不影响基本的使用)


## 配置自动备份


由于今后所有的密码都打算用这个自部署的bitwarden管理，万一哪天服务器寄了、数据库没了，麻烦可就大了，因此有必要定期为数据库进行备份。这里我使用的是支持webdav的[坚果云](https://www.jianguoyun.com/)，虽然月免费上传额度只有1GB，不过只用来备份bitwarden数据库肯定是够用了。


首先前往坚果云，创建一个bitwarden文件夹，用以存放bitwarden的数据库备份，然后前往“[安全选项](https://www.jianguoyun.com/d/home#/safety)”页面申请一个应用，它会提供一个访问密码。然后<s>写</s>抄一个Shell脚本用来向打包数据库并上传到坚果云：

```bash
#!/bin/sh

set -e

username=xxx
password=xxx

filename="bitwarden-`date +%F`.tar.gz"
cd /path/to/your/vaultwarden-basedir/
tar czf "${filename}" bw-data/
curl -u "${username}:${password}" -T "${filename}" "https://dav.jianguoyun.com/dav/bitwarden/"

rm "${filename}"
```

上面代码中，需要将`username`和`password`分别修改为坚果云的账号以及前面申请的访问密码。


最后，设置一条crontab定时任务，一天执行一次该脚本。


终于把密码库部署完了，好耶！「忘记主密码」、「密码库被盗」等随机事件可指日而待也！
