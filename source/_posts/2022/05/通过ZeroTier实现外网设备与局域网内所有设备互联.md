---
title: 通过ZeroTier实现外网设备与局域网内所有设备互联
id: 7739
date: 2022-05-13 20:33:03
categories: [瞎捣鼓经历]
tags: ['OpenWrt', 'ZeroTier', '计算机网络']
cover: https://blogfiles.oss.fyz666.xyz/png/7d09d814-9a31-43c4-8fab-51528c872dc0.png
disableNunjucks: true
---

前一篇文章，我们已经可以通过为设备安装ZeroTier软件来接入虚拟局域网，以此实现P2P访问，但这种方案的问题在于，需要为每一台想接入的设备均安装ZeroTier软件并在控制台加入网络，非常不方便。

其实我们只需要在局域网的出口设备——路由器上安装该软件，并进行一定的配置，就可以达到外网访问任意局域网设备的效果。

![](https://blogfiles.oss.fyz666.xyz/png/7d09d814-9a31-43c4-8fab-51528c872dc0.png)
## 前置条件


- 路由器系统：OpenWrt
- 一个ZeroTier虚拟局域网ID
- OpenWrt内网段（文中假设为192.168.0.0/24）与ZeroTier虚拟网段无冲突
- 愿意捣鼓、无惧踩坑的你

## OpenWRT端软件配置


后文将默认你已经在OpenWrt上成功安装了ZeroTier客户端，否则请出门左转～


首先，如果是自建planet，我们需要将planet文件放到ZeroTier的配置目录下，planet文件的生成方法见[此文](/blog/7728/)。如果是自建moon，则需要将moon文件放置到配置目录的moons.d目录下，本文假设配置目录为`/etc/zerotier`。需要注意的是，OpenWrt下某些版本的ZeroTier，行星服务器的配置文件名可能并不是planet，而是world。


接下来，我们通过uci对zerotier服务进行配置：

```shell
mkdir -p /etc/zerotier/moons.d

uci set zerotier.sample_config.enabled='1'
uci set zerotier.sample_config.config_path='/etc/zerotier'
uci commit zerotier
```

接下来，查看zerotier的配置文件（`cat /etc/config/zerotier`），不出意外的话，刚刚修改的参数已经填写到文件中了。然后重启路由器。


设置网络的secret参数：

```shell
uci set zerotier.sample_config.secret="$(cat /var/lib/zerotier-one/identity.secret)"
uci commit zerotier
```

重启ZeroTier服务，并使用命令`zerotier-cli join`加入网络。稍等片刻，在网页端控制台中即可发现新设备的加入，进行授权。然后小等一会，回到路由器终端，执行以下命令检查状态：

```shell
zerotier-cli listnetworks
```

若一切正常，应该会显示加入的网络与分配到的虚拟IP地址。至此，OpenWrt客户端软件配置已完成，接下来我们需要配置一下路由与防火墙。


## ZeroTier静态路由配置


前往ZeroTier网页端，对虚拟网络进行管理，选择Routes，添加一条配置，其Targets为OpenWrt内网网段（例如：192.168.0.0/24），Gateway配置为ZeroTier分配给OpenWrt的IP地址。如此，静态路由配置完成。


## OpenWrt网络配置


首先执行`ifconfig`命令看一下ZeroTier分配给的接口名称，例如我这里是zt0。

![](https://blogfiles.oss.fyz666.xyz/png/813e833c-acdf-4f7a-9103-5c703b677ffb.png)
来到luci界面，依次选择Network->Interfaces，添加一条新的interface，命名为zerotier，将其物理端口绑定为前面的zt0，防火墙新建一条命名为zerotier：

![](https://blogfiles.oss.fyz666.xyz/png/b27fdadf-722e-43bb-ae97-b1791d3df92f.png)
然后前往Network->Firewall，配置如下：

![](https://blogfiles.oss.fyz666.xyz/png/68fa929e-c387-4053-9083-89df0338f673.png)
最后，在OpenWrt中执行下面命令：

```shell
iptables -I FORWARD -i zt0 -j ACCEPT
iptables -I FORWARD -o zt0 -j ACCEPT
iptables -t nat -I POSTROUTING -o zt0 -j MASQUERADE
```

注意将zt0修改为ZeroTier为你分配的接口名称。


经过上面这些配置，外网接入虚拟局域网的设备就可以与OpenWrt局域网内的所有设备互访了。在配置成功后，我们可以将防火墙的三条规则写入Custom Rules中，方便开机自动启用。
