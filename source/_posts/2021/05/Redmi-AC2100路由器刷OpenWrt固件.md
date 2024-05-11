---
title: Redmi AC2100路由器刷OpenWrt固件
id: 5372
date: 2021-05-13 18:05:30
categories: [瞎捣鼓经历]
tags: ['OpenWrt', '路由器']
cover:
disableNunjucks: false
---

本文参考自下面视频：

{% link [John] Redmi AC2100 OpenWrt installation (web exploit),YouTube,https://www.youtube.com/watch?v=d3km5n-d4io&t=199s&ab_channel=JohnMactavish %}


首先感谢这位一口流利Chinglish的老哥发的这个视频让我毫无困难地刷机成功。接下来本文将该视频以文字的形式描述一下。

## 硬件要求


如题所示，你需要一台Redmi AC2100路由器，其他openwrt支持的小米系列路由器好像也适用，但本文只针对这一种，以下所有内容仅保证适用于AC2100，其他小米系列可作为参考自己尝试。


如何判断一款路由器是否被openwrt所支持：[支持列表](https://openwrt.org/zh/toh/start)


这里我好不容易才找到一款在某东商城和支持列表的交集里的路由器（应该是我的搜索方式不对），也就是这款红米AC2100，某东售价159（不是广告）。


另外，还需要一台能连网线的电脑（openwrt默认关闭WiFi功能，需要通过网线连接打开WiFi，才能无线上网）。


## 软件要求


首先，可能不必要的一步操作，如视频所说，需要先下载Redmi AC2100的官方固件，版本为2.20.3（[传送门](http://cdn.cnbj1.fds.api.mi-img.com/xiaoqiang/rom/ac2100/miwifi_rm2100_all_fb720_2.0.23.bin)）为啥可能不必要，因为我发现我买过来这款路由器自带的版本已经是2.20.3了。


然后去openwrt官网下载适合Redmi AC2100的openwrt固件（[传送门](https://openwrt.org/toh/xiaomi/xiaomi_redmi_router_ac2100)），选择Installation中Firmware OpenWrt snapshot Install下的两个链接进行下载。


## 操作流程


第一步，用网线连接电脑与路由器的LAN口，然后浏览器打开192.168.31.1，在界面中找到软件升级，通过本地文件升级，选择2.20.3版本的软件包即可，升级大概需要2-5分钟。


稍等片刻，路由器其中一个蓝灯亮起，意味着升级完成。


### 开启路由器的SSH服务


接下来需要先开启路由器的SSH服务，利用其自带的web api完成。


继续访问192.168.31.1，登录成功后，浏览器地址栏中出现一串参数，找到其中的stok参数，保存下来。


依次访问以下三个网址：


- `http://192.168.31.1/cgi-bin/luci/;stok=<YOUR-STOK>/api/misystem/set_config_iotdev?bssid=Xiaomi&user_id=longdike&ssid=-h%3Bnvram%20set%20ssh%5Fen%3D1%3B%20nvram%20commit%3B`
- `http://192.168.31.1/cgi-bin/luci/;stok=<YOUR-STOK>/api/misystem/set_config_iotdev?bssid=Xiaomi&user_id=longdike&ssid=-h%3Bsed%20-i%20's/channel=.*/channel=%5C%22debug%5C%22/g'%20/etc/init.d/dropbear%3B`
- `http://192.168.31.1/cgi-bin/luci/;stok=<YOUR-STOK>/api/misystem/set_config_iotdev?bssid=Xiaomi&user_id=longdike&ssid=-h%3B/etc/init.d/dropbear%20start%3B`

其中网址中的`<YOUR-STOK>`需要替换为前面保存的stok值。


不出意外的话（三次访问均得到{code: 0}），SSH服务已经打开，但不知道默认的密码是多少，不过还是可以通过web api进行设置。


访问以下网址可将root用户的密码修改为admin：


`http://192.168.31.1/cgi-bin/luci/;stok=<YOUR-STOK>/api/misystem/set_config_iotdev?bssid=Xiaomi&user_id=longdike&ssid=-h%3B%20echo%20-e%20'admin%5Cnadmin'%20%7C%20passwd%20root%3B`


### 开始正式刷机


通过一切你能想到的方法将两个openwrt固件文件下载到路由器系统的/tmp文件夹下（其他文件夹所在分区好像都不可写）。


视频中推荐的方法是使用python2的SimpleHTTPServer（这玩意在python3中变成了http.server）通过它迅速在电脑端建立起一个HTTP服务，然后在路由器里wget一下就好了。另外还可以用scp命令将文件直接拷贝到路由器/tmp目录下，也非常滴方便。


下载完文件后，在/tmp目录下执行以下几句命令：



```shell
mtd write openwrt-ramips-mt7621-xiaomi_redmi-router-ac2100-squashfs-kernel1.bin kernel1
mtd write openwrt-ramips-mt7621-xiaomi_redmi-router-ac2100-squashfs-rootfs0.bin rootfs0

nvram set uart_en=1
nvram set bootdelay=5
nvram set flag_try_sys1_failed=1
nvram commit
```

最后reboot重启系统。等蓝色指示灯再一次亮起，则可以再次通过SSH登录，不过这一次ip地址变成了192.168.1.1，而且没有设定密码。刷机成功的情形：SSH登录时的欢迎信息变成了如下：


![](https://fastly.jsdelivr.net/gh/windshadow233/BlogStorage@files/jpg/3bdb9a1c40c87a292c48c60835f600a4.jpg)访问`http://192.168.1.1`，发现什么都没有，这是因为该openwrt固件默认不带web操作界面，路由器WAN口接上网线，成功上网后，通过以下两句命令进行安装，若安装失败，请百度“openwrt换源”。



```shell
opkg update
opkg install luci
```

接下来在Network/Wireless中将WiFi开启，路由器就可以正常使用了！
