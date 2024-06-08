---
title: 如何在校外使用北邮人PT站
id: 6304
date: 2021-08-11 08:45:07
categories: [瞎捣鼓经历]
tags: ['IPv6', 'Linux', 'V2Ray', '树莓派', '计网']
cover: https://blogfiles.oss.fyz666.xyz/png/ea524747-7787-48e0-8d51-c8d7ee7f9226.png
disableNunjucks: true
swiper_index: 1
description: 完美解决离校后无法使用北邮人PT站的问题
---

两年前在朋友的邀请下加入了北邮人PT站（[bt.byr.cn](https://bt.byr.cn)，最近更改了域名为[byr.pt](https://byr.pt/)），该站点是一个纯IPv6站，且屏蔽了国内三大运营商的IPv6地址，在国内只能通过教育网来访问

北邮人PT站资源丰富，相当实用。为此，我还特意在树莓派上搭建了一个BT资源下载站，用于下载资源以及长期做种。


研二宿舍搬迁，我为方便起见去外面租了房子，这就导致我接不上教育网，也就没有办法访问站点了。在探明了访问不了的原因后，我就想到是不是可以通过科学上网的方法翻进教育网，从而访问到站点。恰好我在学校实验室里有一台服务器，它是接入教育网的，因此可以用它来做正向代理去请求站点，实现从非教育网访问到北邮人站点。


由于我在实验室的服务器并没有公网IPv4地址，但拥有IPv6 Global地址，因此这要求客户端也拥有IPv6 Global地址以与服务器通信，不过基于目前国内运营商都已经支持了双栈拨号，这并不是问题。


考虑到大部分人没有这种接入教育网的服务器，还有另外一种更容易满足的选择，即一台拥有海外IPv6地址的VPS。说起这个，就必须推广一下[Vultr](https://www.vultr.com/?ref=8868429)这个我曾经用过很长一段时间的平台了，这个平台的VPS可添加IPv6 Global地址，按使用时间收费，并且如果使用IPv6 only的服务器，最低仅需2.5$/月，还是非常划算的！


我用到的软件还是已经用习惯了的V2ray，接下来给出服务器上以及本地的配置。


服务器：

```json
{
  "inbounds": [
    {
      "port": xxxx,
      "protocol": "vmess",
      "settings": {
        "clients": [{
          "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
          "alterID": 0
        }]
      }
    }
  ],
  "outbounds": [
    {
      "tag": "IP6_out",
      "protocol": "freedom",
      "settings": {
        "domainStrategy": "UseIPv6"
      }
    }
  ],
  "routing": {
    "domainStrategy": "IPOnDemand",
    "rules": [
      {
        "type": "field",
        "outboundTag": "IP6_out",
        "domain": [
          "byr.pt"
        ]
      }
    ]
  }
}
﻿
```

在上述配置中，请手动修改端口号以及UUID。服务器配置主要针对北邮人站点的域名进行了路由选择，指定`domainStrategy`为`UseIPv6`来声明使用IPv6协议。


客户端：

```json
{
  "inbounds": [
    {
      "tag": "transparent",
      "listen": "::",
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
      "tag": "byr",
      "protocol": "vmess",
      "settings": {
        "vnext": [
          {
            "address": "IPv6 of Your Server",
            "port": xxxx,
            "users": [
              {
                "id": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                "alterId": 0
              }
            ]
          }
        ]
      },
      "streamSettings": {
        "sockopt": {
          "mark": 255
        }
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
        "protocol": ["bittorrent"],
        "outboundTag": "direct"
      },
      {
        "type": "field",
        "domain": [
          "byr.pt"
        ],
        "outboundTag": "byr"
      }
    ]
  }
}
```

客户端配置中，首先需要填写服务器的IPv6地址（如果服务器有公网IPv4就直接写公网IPv4）、端口号以及UUID，后两者与前面服务端配置中的对应。另外，如果服务端配置了其他东西比如websocket+tls的，需要在客户端进行简单的修改，这里不再细说。


由于我做的是透明代理，因此需要一个dokodemo-door协议来接收局域网内的流量，并将其分流，将北邮人两个域名的流量转发到vmess节点（即我们的服务器），bittorrent流量则走direct直连。如果涉及到其他的翻墙规则，则需要注意路由rules的顺序。


接下来，在树莓派上写几条ip6tables规则，以转发局域网以及网关自身去往北邮人站点的流量到dokodemo-door。

```bash
ip -6 rule add fwmark 1 table 106
ip -6 route add local ::/0 dev lo table 106

# 代理局域网流量
ip6tables -t mangle -N V2RAY
ip6tables -t mangle -A V2RAY -j RETURN -m mark --mark 0xff
ip6tables -t mangle -A V2RAY -p tcp -j TPROXY -d 2001:da8:215:4078:250:56ff:fe97:654d --on-ip ::1 --on-port 12345 --tproxy-mark 1
ip6tables -t mangle -A PREROUTING -j V2RAY

# 代理网关自身的流量
ip6tables -t mangle -N V2RAY_MASK
ip6tables -t mangle -A V2RAY_MASK -j RETURN -m mark --mark 0xff
ip6tables -t mangle -A V2RAY_MASK -p tcp -j MARK -d 2001:da8:215:4078:250:56ff:fe97:654d --set-mark 1
ip6tables -t mangle -A OUTPUT -j V2RAY_MASK
```

规则里的`2001:da8:215:4078:250:56ff:fe97:654d`即为北邮人站点的地址，我们将去往这个地址的IPv6流量转入本地的dokodemo-door（12345端口）进行分流。


如此一来，树莓派上的BT资源下载站已经可以正常访问到北邮人站点进行下载与做种了，但局域网内其他设备并没有办法访问北邮人站点，这是因为设备的IPv6网关并没有指向树莓派，目前我还没有找到和IPv4那样自定义分配网关的方法，因为DHCPv6和DHCPv4的区别挺大的。因此我只能暂时通过手动输入以下命令来指定网关：

```bash
route -A inet6 add ::/0 gw fe80::d35e:9a40:93a9:e687 dev wlp62s0
```

fe80::d35e:9a40:93a9:e687这一串是我树莓派网口的link-local地址，wlp62s0则是局域网设备的无线网卡设备名，这样就可以把这一台设备上的IPv6流量转发至树莓派的网口了。


鉴于下载工作不需要在电脑上执行，在电脑端只要偶尔上一下站点下两个torrent文件就行，因此感觉这样做也没什么大问题。


当然如果你的路由器性能足够好，且支持安装V2ray这类软件，那么也完全可以把透明代理架设在路由器上，这样就免去了修改网关的步骤，并且这样也不需要代理网关自身的流量了。这也是目前我使用的方法。最后给出一个我目前配置下的网络拓扑示意图：

![](https://blogfiles.oss.fyz666.xyz/png/ea524747-7787-48e0-8d51-c8d7ee7f9226.png)
如果你有方法可以让OpenWrt路由器更改局域网设备的IPv6网关，烦请告诉我！！
