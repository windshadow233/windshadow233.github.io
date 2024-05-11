---
title: 使用Nginx反向代理ShareLaTeX服务并配置SSL
id: 7689
date: 2022-05-10 05:39:07
categories: [瞎捣鼓经历]
tags: ['Nginx', 'ShareLaTeX', 'SSL', '反向代理']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/6dcb6b6f9c32bc7a8947a3884b36609c.png
disableNunjucks: true
---

前面已经为WordPress配置了反代，此文将给出Nginx反代ShareLaTeX的配置。

首先，我们将ShareLaTeX的docker容器映射到一个宿主机上不常用的空闲端口（例如8080）。


然后配置Nginx：

```nginx
server{
  listen 80;
  listen 443 ssl;
  server_name latex.fyz666.xyz;
  index  index.php index.html index.htm;
  ssl_certificate /etc/letsencrypt/live/blog.fyz666.xyz/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/blog.fyz666.xyz/privkey.pem;
  if ($scheme = http){
    return 301 https://$host$request_uri;
  }
  location / {
    proxy_pass http://127.0.0.1:8080/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Powered-By the-internet;
    add_header Content-Security-Policy upgrade-insecure-requests;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
  }
}
```

上述配置将域名latex.fyz666.xyz反代到本地的8080端口，前面的基本配置与[上篇文章](/blog/7673/)别无二致。而`location`配置下有两条需要注意的配置字段：

```nginx
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

这两条字段是用来配置Websocket协议的反代的。


最开始我并未加上这两条配置，然后在打开Latex项目时，出现了以下error：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/6dcb6b6f9c32bc7a8947a3884b36609c.png)
但在十多秒后，又能够正常打开项目，经研究，我发现是Websocket连接报了400。原因可见[这篇文章](https://echizen.github.io/tech/2018/10-21-nginx-websocket)。加上那两个配置字段后，反向代理终于正常工作了。
