---
title: 使用Nginx反向代理DoH服务
id: 10026
date: 2024-03-28 03:32:32
categories: [瞎捣鼓经历]
tags: ['DNS', 'DNS over HTTPS', 'Nginx', '反向代理']
cover: 
disableNunjucks: true
---

DoH（DNS over Https）是一种通过HTTPS来进行DNS解析的协议，它使用HTTPS协议加密DoH客户端和基于DoH的DNS解析程序之间的数据，防止中间人对DNS数据的窃听和操纵，从而提高客户端隐私和安全性。

国内外都有一些服务商提供公共的DoH服务，不过由于一些众所周知的原因，我会更倾向于使用国外服务商的DoH，随便列举几条比较知名的：


- OpenDNS: `https://doh.opendns.com/dns-query`
- CloudFlare: `https://cloudflare-dns.com/dns-query`
- dns.sb: `https://doh.dns.sb/dns-query`
- Google: `https://dns.google/resolve`
- IBM Quad9: `https://dns.quad9.net:5053/dns-query`

同样的，由于一些原因，我们访问这些服务会有些困难。考虑到我有一台位于海外的云服务器，因此可以考虑通过Nginx做一个反向代理，来间接访问这些服务。下面是我配置的反向代理：

```nginx
upstream google{
  server 8.8.8.8:443;
  server 8.8.4.4:443;
}

upstream cloudflare{
  server 104.16.249.249:443;
  server 104.16.248.249:443;
}

upstream sbdns{
  server 185.222.222.222:443;
  server 103.121.210.210:443;
  server 202.5.221.130:443;
  server 202.5.221.131:443;
  server 202.5.221.132:443;
  server 202.5.221.133:443;
  server 202.5.221.134:443;
  server 45.125.0.26:443;
  server 165.22.61.129:443;
}

upstream opendns{
  server 146.112.41.2:443;
}

upstream ibm-quad9{
  server 9.9.9.9:5053;
  server 149.112.112.112:5053;
}

server{
  ...
  location /query-google{
    proxy_pass https://google/resolve;
    proxy_set_header Host dns.google;
    proxy_set_header accept application/dns-json;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass_request_headers on;
  }
  location /query-cf{
    proxy_pass https://cloudflare/dns-query;
    proxy_set_header Host cloudflare-dns.com;
    proxy_set_header accept application/dns-json;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass_request_headers on;
  }
  location /query-sb{
    proxy_pass https://sbdns/dns-query;
    proxy_set_header Host doh.sb;
    proxy_set_header accept application/dns-json;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass_request_headers on;
  }
  location /query-ibm{
    proxy_pass https://ibm-quad9/dns-query;
    proxy_set_header Host dns.quad9.net;
    proxy_set_header accept application/dns-json;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_pass_request_headers on;
  }
  location /{
    default_type text/html;
    return 418 "I'm a teapot";
  } 
}
```

如此，就可以通过这个反向代理来对这些海外公共DoH服务进行访问了，使用的方法也很简单，可以用[cloudflared](https://github.com/cloudflare/cloudflared)将其部署在树莓派之类的设备上。


为了避免通过域名DoH来解析自己导致死循环，可以加一个本地host。
