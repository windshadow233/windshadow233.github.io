---
title: 局域网下禁止某些域名的AAAA解析
id: 7934
date: 2022-08-02 16:03:53
categories: [瞎捣鼓经历]
tags: ['DNS', 'IPv6', 'OpenWrt']
cover: 
disableNunjucks: true
---

在双栈上网环境下，有一个很常规的需求，即我们需要避免使用IPv6地址来访问某些网站（如果你无法理解这种需求，就不需要看下去了）。

首先，由于需要访问某些IPv6 only的网站，我并不希望禁止全局AAAA解析。虽然很多操作系统可以设置IP协议的优先级，但若能从源头解决问题，当然是最好的，即能否只禁止解析这些指定域名的AAAA记录。


听说Smartdns这个软件提供了该功能，但无奈我在路由器上怎么都开不了这个软件（用过官方发布的release，也自己编译了几遍，均无用，可能是操作姿势不对）。后续研究了一下，发现其实只用Dnsmasq就可以做到这一点。


假设我们需要禁止域名example.com的AAAA解析，那么只需在Dnsmasq的配置文件（位于`/etc/dnsmasq.d/`目录下）中添加如下一条：

```ini
address=/example.com/::
```

并重启Dnsmasq。如此一来，等原先的DNS缓存过期以后访问该域名就可以正常走IPv4流量了。
