---
title: 在OpenWrt上配置透明代理
id: 5380
date: 2021-05-14 06:31:04
categories: [瞎捣鼓经历]
tags: ['Linux', 'OpenWrt', 'V2Ray', '科学上网', '计算机网络', '路由器']
cover: https://blogfiles.oss.fyz666.xyz/jpeg/8e58d290-35a8-4629-8534-9c9effa089cb.jpeg
disableNunjucks: false
---

用OpenWrt的原因，我觉得对大部分中国大陆的互联网用户而言是不言而喻的，其拥有比一般路由器更高的灵活性与自由度，更重要的是可以方便舒适地进行某些活动。

![](https://blogfiles.oss.fyz666.xyz/jpeg/8e58d290-35a8-4629-8534-9c9effa089cb.jpeg)这里我们用到的梯子就是v2ray，相信能用上这款软件的，应该或拥有一台VPS并配置好了v2ray服务端，或拥有了能用的机场节点，本文不介绍如何获取节点，只给出在已有节点的条件下，一种能实现透明代理的客户端配置。

配置来自于下面文档：

{%link 配置透明代理规则,新V2Ray白话文指南,https://guide.v2fly.org/app/tproxy.html#%E9%85%8D%E7%BD%AE%E9%80%8F%E6%98%8E%E4%BB%A3%E7%90%86%E8%A7%84%E5%88%99 %}

并经过了一些调整，并删去了一些udp和dns的配置。


## 为什么要用透明代理？


一般而言，v2ray在各操作系统上都有拥有GUI界面的客户端，配置也十分容易，但由于需要下载软件、开启软件、甚至手动切换或选择代理模式，因此容易造成体验不佳（没错我就是这么懒），另外，跑在电脑端的代理软件无法获取操作系统的最高权限，即使开了全局代理模式也会无法接管到某些处于网络协议栈低层的流量，例如如果你有玩Steam游戏的习惯，你大概率会发现v2ray无法加速大部分steam游戏；再如，你想在家里的智能电视上翻墙看Netflix影片，总不能在电视系统上装个代理软件吧。在种种特殊需求以及懒病的加持下，我们就有了这个透明代理的需求。透明代理可以简单理解为一台介于客户端与服务端的设备，用以主动处理转发客户端的请求，基于规则将你希望交给v2ray服务端处理的请求转发到代理端口，否则直连，这样就使得客户端用户可以无缝切换代理与非代理状态，从而感受不到“墙”或代理的存在，实现所谓的“透明代理”，同时作为客户端接入局域网的唯一路径，其也可以无视客户端操作系统而接管所有的流量，实现真正的全局代理。


透明代理有多种实现，我这里采用最直接的硬路由刷OpenWrt的方法，即在网关路由器上配置一些转发规则。另外，考虑到一般的路由器CPU的算力比较差，透明代理也可以设置在旁路由上，以提升体验。


## 安装V2ray


首先，因为是在路由器上做透明代理，故需要在路由器上安装适应的v2ray。可以参考github的一个项目：[v2ray-openwrt](https://github.com/kuoruan/openwrt-v2ray)


在项目的releases中选择适合自己openwrt路由器CPU架构的版本。


CPU架构可以通过以下命令获知：



```bash
opkg print-architecture | awk '{print $2}' | grep -v all | grep -v noarch
```

例如，我的路由器上的输出结果是：mipsel_24kc。


将下载下来的文件放到路由器上，通过`opkg install v2ray-core*.ipk`命令进行安装，若安装失败，则需要检查版本是否匹配、是否进行了换源。


透明代理用到的是v2ray的dokodemo-door协议，下面给一个基于白名单规则的配置文件，适合平时访问国外站点比较多的用户使用：



```json
{
  "inbounds": [
    {
      "tag": "transparent",
      "port": 12345,
      "protocol": "dokodemo-door",
      "settings": {
        "network": "tcp,udp",
        "followRedirect": true
      },
      "sniffing": {
        "enabled": true,
        "destOverride": ["http", "tls"]
      },
      "streamSettings": {
        "sockopt": {
          "tproxy": "tproxy"
        }
      }
    }
  ],
  "outbounds": [
    { 
      "tag": "proxy",
      "protocol": "vmess",
      "sendThrough": "0.0.0.0",
      "settings": {
        "vnext": [
          ...
        ]
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      }
    },
    {
      "tag": "block",
      "protocol": "blackhole",
      "settings": {
        "response": {"type": "http"}
      }
    },
    {
      "tag": "direct",
      "protocol": "freedom",
      "settings": {},
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
      }
    }
  ],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "type": "field",
        "outboundTag": "block",
        "domain": ["geosite:category-ads-all"]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "domain": ["geosite:cn"]
      },
      {
        "type": "field",
        "outboundTag": "direct",
        "ip": [
          "geoip:cn",
          "geoip:private"
        ]
      }
    ]
  }
}
﻿
```

vnext的配置就按你VPS服务器的配置来。通过此配置文件启动的v2ray路由满足以下几条（白名单）规则：


1. 首先，屏蔽所有在geosite:category-ads-all列表里的常见广告域名。
2. 然后对所有常见中国大陆域名直接走直连。
3. 若不满足第二条，进行DNS解析，若得到结果为中国大陆的ip地址或内网ip地址，则走直连。
4. 其他情况一律走代理。

然后运行以下几条命令设置流量转发规则：



```bash
ip rule add fwmark 1 table 100
ip route add local 0.0.0.0/0 dev lo table 100

iptables -t mangle -N V2RAY
iptables -t mangle -A V2RAY -d 127.0.0.1/32 -j RETURN
iptables -t mangle -A V2RAY -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A V2RAY -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A V2RAY -d 192.168.0.0/16 -p tcp -j RETURN
iptables -t mangle -A V2RAY -j RETURN -m mark --mark 0xff
iptables -t mangle -A V2RAY -p tcp -j TPROXY --on-ip 127.0.0.1 --on-port 12345 --tproxy-mark 1
iptables -t mangle -A PREROUTING -j V2RAY

iptables -t mangle -N V2RAY_MASK
iptables -t mangle -A V2RAY_MASK -d 224.0.0.0/4 -j RETURN
iptables -t mangle -A V2RAY_MASK -d 255.255.255.255/32 -j RETURN
iptables -t mangle -A V2RAY_MASK -d 192.168.0.0/16 -p tcp -j RETURN
iptables -t mangle -A V2RAY_MASK -j RETURN -m mark --mark 0xff
iptables -t mangle -A V2RAY_MASK -p tcp -j MARK --set-mark 1
iptables -t mangle -A OUTPUT -j V2RAY_MASK

iptables -t mangle -N DIVERT
iptables -t mangle -A DIVERT -j MARK --set-mark 1
iptables -t mangle -A DIVERT -j ACCEPT
iptables -t mangle -I PREROUTING -p tcp -m socket -j DIVERT
```

做完这些设置，应该就正常访问Google了，但我发现还是没办法访问YouTube等在线学习网站，好像是因为DNS污染的问题，关于这个，其实v2ray也提供了DNS转发机制，不过我目前没有尝试，我目前使用的方法可参考此文：[无污染DNS服务搭建](/blog/5447/)。另外还有一种方法，即使用v2ray劫持53端口来实现反dns污染，可以[参考此文](https://guide.v2fly.org/app/tproxy.html#%E9%85%8D%E7%BD%AE%E9%80%8F%E6%98%8E%E4%BB%A3%E7%90%86%E8%A7%84%E5%88%99)。


最后，非常重要的是：


**本文所介绍的内容主要是为了方便学习、外贸交流、科研等工作。在墙外请严格约束自身，遵守本国法律法规，切勿在任何地方发布分裂国家，涉恐等违法犯罪的言论。**
