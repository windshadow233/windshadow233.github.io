---
title: OpenWrt下游主机通过IPv6上网的一种方法
id: 5405
date: 2021-05-15 16:48:28
categories: [瞎捣鼓经历]
tags: ['IPv6', 'OpenWrt', '计算机网络', '路由器']
cover: https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/jpg/f7f12d10f8c376f3d7597229fddd5350.jpg
disableNunjucks: true
---

IPv6因IPv4地址池不够用而被提出，至今已有近30年了，但在国内的普及程度仍非常有限，不过，国内的ISP运营商基本都已经提供IPv6接入了，也就是说家里的宽带一般是支持IPv6的。

很多家用路由器尚无法为局域网设备发放IPv6的全局单播（Global）地址，更有一些号称支持IPv6的路由器，其下游局域网设备只能获取到链路本地（Link-Local）地址，其仅支持同一链路的设备通信（类似于局域网的作用），而不能访问到公网的IPv6。随着IPv6的普及，支持公网IPv6地址分配的路由器今后将会越来越多。


OpenWrt固件支持以Native方式通过WAN口从ISP获取IPv6全局单播地址，虽然支持程度一般，但至少可以通过IPv6上网了。


首先要保证WAN口有IPv6全局单播地址，然后打开`/etc/config/network`文件，在其中可以看到以下配置：

```ini
config interface 'wan6'
    option proto 'dhcpv6'
```

可知IPv6对应的接口是wan6，接下来配置文件`/etc/config/dhcp`：

```ini
config dhcp 'lan'
	...
	option dhcpv6 'relay'
	option ra 'relay'
	option ndp 'relay'

config dhcp 'wan6'
	option interface 'wan6'
	option dhcpv6 'relay'
	option ra 'relay'
	option ndp 'relay'
	option master '1'
```

只要配置'lan'和'wan6'的几条选项即可。最后重启dnsmasq与odhcp：

```bash
/etc/init.d/dnsmasq restart
/etc/init.d/odhcpd restart
```

稍等片刻，下游设备就可以获取到IPv6全局单播地址啦。


当然通过IPv6上网还有其他方法，例如NAT6（相当于IPv4的NAT），但反正IPv6地址根本用不完，获取一个全局单播地址何乐而不为呢？
