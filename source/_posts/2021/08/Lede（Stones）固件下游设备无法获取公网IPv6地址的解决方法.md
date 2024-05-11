---
title: Lede（Stones）固件下游设备无法获取公网IPv6地址的解决方法
id: 6326
date: 2021-08-21 11:28:05
categories: [Debug]
tags: ['IPv6', 'Linux', 'OpenWrt', '计算机网络', '路由器']
cover:
disableNunjucks: true
---

[前文](/blog/5405/)曾提到过OpenWrt通过relay（中继）模式使得自身以及下游设备从ISP运营商获取原生公网IPv6的方法，但我在Phicomm K3路由器上刷了lede（Stones）固件后，按照相同的配置方法竟无法让下游设备获取到公网IPv6地址。


首先，家里的网络结构是通过一台光猫进行双栈拨号上网，路由器WAN口接到光猫LAN口，家里所有设备接入路由器的无线网络来进行上网。按照前面文章的方法进行配置后，我遇到的情况如下：


- 路由器的WAN口确实通过光猫获取到了两个2409开头的IPv6 Global地址
- 接入无线网络的设备均无法获取IPv6 Global地址，仅有一个Link-Local地址
- 路由器虽有IPv6 Global地址，但无法ping通任何外网的IPv6地址

接下来就是漫长的问题排查之路。


首先我用电脑直接连接了光猫的WiFi，发现电脑可以获取到两个IPv6 Global地址，且可以ping通外网的IPv6，这说明光猫的配置以及拨号都没有问题。


接下来登录路由器的命令行，查看IPv6网关的分配情况：

![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/png/7033de710c31ee9a554e01bf10b569c1.png)
fe80::1正是光猫LAN口的IPv6 Link-Local地址，看上去好像没有毛病。


ping一下网关试试：

```bash
ping6 fe80::1 -I eth0.2
```

发现果然（居然）ping不通，看来问题一定就出在这一点上了，路由器无法正常与网关通信，导致下游设备无法从ISP获取IPv6地址。


那么为什么之前在Redmi AC2100刷入的OpenWrt，可以正常使用IPv6上网，现在刷的lede就不行呢，关于此，我查了不少资料。


很多论坛博客中提到，需要将Network->Interfaces下LAN口和WAN、WAN6接口的Use builtin IPv6-management选项取消勾选，我一看，发现并没有勾选。


另外还有博客提到，需要在Network->DHCP and DNS->Advanced Settings取消勾选“禁止解析IPv6”，我看了一下，我的管理界面中并没有这个选项，我也懒得去查该选项对应到文件里的字段是啥，因为这个选项的作用是禁止解析DNS的AAAA记录，即IPv6地址，勾选此项最多导致DNS解析IPv6失败，理论上并不会导致路由器ping不通网关。


黔驴技穷之时，我想到有可能是某些软件的配置与IPv6冲突了，毕竟这款固件自带的软件非常之多，其中有不少是开机自启的，指不定就有哪个软件产生了冲突。上网一查，果然发现有这么回事，即lede固件与IPv6冲突的问题，冲突的原因在于一个称为mwan3的东西，它是用来做负载均衡与多拨的，后来我在Github上查到了解决方法：[关于 mwan3 与 IPv6 冲突的问题](https://github.com/SuLingGG/OpenWrt-Rpi/issues/3)，跟着他操作了一遍，就把问题解决了！（上面这个链接已经无了，建议自己上谷歌搜索，或者参考下面的方法）。


既然前面链接404了，我就在此简单记录一下解决方法：


1. 打开文件`/lib/mwan3/mwan3.sh`，将第7行的`IPT6="ip6tables -t mangle -w"`为`IPT6="/bin/true"`
2. 进入luci页面，依次选择Network->Load Balancing->Policy，将Last resort修改为default (use main routing table)
3. 继续选择该页Rules选项卡，增加一条default_rule，Source address填入局域网ipv4的网段，例如如果你的局域网是192.168.1.x这种样子的，就填192.168.1.0/24。Destination address填0.0.0.0/0，Protocol选择all，Policy assigned选择balanced。
4. 重启路由器。
5. 如果仍然不行，重启光猫。

基于这次遇到的问题，我深刻意识到，以后还是得自己编译固件，这样才能充分考虑自己的需求，把自己需要的软件编进去。
